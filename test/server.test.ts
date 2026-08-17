import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, symlink, writeFile } from "node:fs/promises";
import { request as httpRequest } from "node:http";
import { connect, createServer as createNetServer, type Socket } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { startLocalServer, type LocalServer } from "../local-codex/server.js";

async function fixtureRoot(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "tarot-server-test-"));
  await writeFile(join(root, "index.html"), "<h1>Tarot</h1>", "utf8");
  await writeFile(join(root, "app.js"), "window.tarot = true;", "utf8");
  await mkdir(join(root, "牌面-测试"));
  await writeFile(join(root, "牌面-测试", "card.jpg"), "image", "utf8");
  await mkdir(join(root, ".git"));
  await writeFile(join(root, ".git", "config"), "secret-sentinel", "utf8");
  await writeFile(join(root, "package.json"), "private-sentinel", "utf8");
  return root;
}

function body(): string {
  return JSON.stringify({
    model: "ignored",
    stream: true,
    messages: [{ role: "user", content: "隐士正位意味着什么？" }],
  });
}

function within<T>(promise: Promise<T>, milliseconds: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const guard = setTimeout(() => reject(new Error(`${label}_guard_timeout`)), milliseconds);
    void promise.then(
      (value) => { clearTimeout(guard); resolve(value); },
      (error) => { clearTimeout(guard); reject(error); },
    );
  });
}

function rawGet(server: LocalServer, path: string, host: string): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const request = httpRequest({
      hostname: server.host,
      port: server.port,
      path,
      method: "GET",
      headers: { host, connection: "close" },
    }, (response) => {
      let responseBody = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => { responseBody += chunk; });
      response.once("end", () => resolve({ status: response.statusCode ?? 0, body: responseBody }));
    });
    request.once("error", reject);
    request.end();
  });
}

async function openUnfinishedBody(server: LocalServer, chunk = "{\"stream\":"): Promise<{
  socket: Socket;
  closed: Promise<string>;
}> {
  const socket = connect({ host: server.host, port: server.port });
  let response = "";
  socket.setEncoding("utf8");
  socket.on("data", (value) => { response += value; });
  const closed = new Promise<string>((resolve) => socket.once("close", () => resolve(response)));
  await within(new Promise<void>((resolve, reject) => {
    socket.once("error", reject);
    socket.once("connect", () => {
      socket.off("error", reject);
      socket.write([
        "POST /v1/chat/completions HTTP/1.1",
        `Host: ${server.host}:${server.port}`,
        `Origin: ${server.origin}`,
        "Content-Type: application/json",
        "Transfer-Encoding: chunked",
        "Connection: keep-alive",
        "",
        chunk.length.toString(16),
        chunk,
        "",
      ].join("\r\n"));
      resolve();
    });
  }), 1_000, "raw_connect");
  return { socket, closed };
}

function assertNoCorsPermissionHeaders(headers: Headers): void {
  for (const name of headers.keys()) {
    assert.equal(name.toLowerCase().startsWith("access-control-allow-"), false, name);
  }
}

test("serves only whitelisted site files and health makes zero runner calls", async (t) => {
  const rootDirectory = await fixtureRoot();
  let calls = 0;
  const server = await startLocalServer({ rootDirectory, port: 0, runner: async () => { calls += 1; return "不应调用"; } });
  t.after(server.close);
  assert.equal((await fetch(`${server.origin}/`)).status, 200);
  assert.equal((await fetch(`${server.origin}/app.js`)).status, 200);
  assert.equal((await fetch(`${server.origin}/%E7%89%8C%E9%9D%A2-%E6%B5%8B%E8%AF%95/card.jpg`)).status, 200);
  const health = await fetch(`${server.origin}/health`);
  assert.deepEqual(await health.json(), { status: "ok", auth: "chatgpt", model: "gpt-5.6-luna" });
  assert.equal(calls, 0);
  assert.equal((await fetch(`${server.origin}/.git/config`)).status, 404);
  assert.equal((await fetch(`${server.origin}/package.json`)).status, 404);
});

test("accepts sequential same-origin completions and emits SSE", async (t) => {
  let calls = 0;
  const server = await startLocalServer({ rootDirectory: await fixtureRoot(), port: 0, runner: async () => { calls += 1; return `第${calls}次回应`; } });
  t.after(server.close);
  for (const expected of ["第1次回应", "第2次回应"]) {
    const response = await fetch(`${server.origin}/v1/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json", origin: server.origin },
      body: body(),
    });
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type") ?? "", /^text\/event-stream/);
    const text = await response.text();
    assert.match(text, new RegExp(expected));
    assert.match(text, /data: \[DONE\]/);
  }
  assert.equal(calls, 2);
});

test("rejects foreign and missing origins without calling the runner", async (t) => {
  let calls = 0;
  const server = await startLocalServer({ rootDirectory: await fixtureRoot(), port: 0, runner: async () => { calls += 1; return "x"; } });
  t.after(server.close);
  for (const origin of [undefined, "https://example.com"]) {
    const headers: Record<string, string> = { "content-type": "application/json" };
    if (origin) headers.origin = origin;
    const response = await fetch(`${server.origin}/v1/chat/completions`, { method: "POST", headers, body: body() });
    assert.equal(response.status, 403);
  }
  assert.equal(calls, 0);
});

test("rejects an invalid Host directly without calling the runner", async (t) => {
  let calls = 0;
  const server = await startLocalServer({
    rootDirectory: await fixtureRoot(),
    port: 0,
    runner: async () => { calls += 1; return "must not run"; },
  });
  t.after(server.close);
  const response = await rawGet(server, "/health", "localhost:43127");
  assert.equal(response.status, 403);
  assert.match(response.body, /invalid_host/);
  assert.equal(calls, 0);
});

test("emits no CORS permission headers on successful or rejected requests", async (t) => {
  const server = await startLocalServer({
    rootDirectory: await fixtureRoot(),
    port: 0,
    runner: async () => "回应",
  });
  t.after(server.close);
  const accepted = await fetch(`${server.origin}/v1/chat/completions`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: server.origin },
    body: body(),
  });
  assert.equal(accepted.status, 200);
  assertNoCorsPermissionHeaders(accepted.headers);
  await accepted.text();
  const rejected = await fetch(`${server.origin}/v1/chat/completions`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://example.com" },
    body: body(),
  });
  assert.equal(rejected.status, 403);
  assertNoCorsPermissionHeaders(rejected.headers);
});

test("rejects encoded traversal and a canonical junction escape", async (t) => {
  const rootDirectory = await fixtureRoot();
  const outside = await mkdtemp(join(tmpdir(), "tarot-server-outside-"));
  await writeFile(join(outside, "secret.jpg"), "escape-sentinel", "utf8");
  const junction = join(rootDirectory, "牌面-junction");
  await symlink(outside, junction, process.platform === "win32" ? "junction" : "dir");
  t.after(async () => {
    await rm(junction, { recursive: true, force: true });
    await rm(outside, { recursive: true, force: true });
  });
  const server = await startLocalServer({ rootDirectory, port: 0, runner: async () => "x" });
  t.after(server.close);
  for (const path of [
    "/%E7%89%8C%E9%9D%A2-%E6%B5%8B%E8%AF%95/%2e%2e/package.json",
    "/%E7%89%8C%E9%9D%A2-junction/secret.jpg",
  ]) {
    const response = await fetch(`${server.origin}${path}`);
    const text = await response.text();
    assert.equal(response.status, 404, path);
    assert.doesNotMatch(text, /private-sentinel|escape-sentinel/);
  }
});

test("uses the fixed production port when no test override is supplied", async (t) => {
  const server = await startLocalServer({ rootDirectory: await fixtureRoot(), runner: async () => "x" });
  t.after(server.close);
  assert.equal(server.port, 43127);
  assert.equal(server.origin, "http://127.0.0.1:43127");
});

test("reports and rejects an expired ChatGPT login without a runner call", async (t) => {
  let calls = 0;
  const server = await startLocalServer({
    rootDirectory: await fixtureRoot(),
    port: 0,
    authCheck: async () => false,
    runner: async () => { calls += 1; return "must not run"; },
  });
  t.after(server.close);
  assert.deepEqual(await (await fetch(`${server.origin}/health`)).json(), {
    status: "not_ready",
    auth: "required",
    model: "gpt-5.6-luna",
  });
  const response = await fetch(`${server.origin}/v1/chat/completions`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: server.origin },
    body: body(),
  });
  assert.equal(response.status, 503);
  assert.match(await response.text(), /chatgpt_login_required/);
  assert.equal(calls, 0);
});

test("returns 429 for concurrency and never starts a second runner", async (t) => {
  let calls = 0;
  let release!: () => void;
  let markStarted!: () => void;
  const blocked = new Promise<void>((resolve) => { release = resolve; });
  const started = new Promise<void>((resolve) => { markStarted = resolve; });
  const server = await startLocalServer({ rootDirectory: await fixtureRoot(), port: 0, runner: async () => { calls += 1; markStarted(); await blocked; return "完成"; } });
  t.after(server.close);
  const request = () => fetch(`${server.origin}/v1/chat/completions`, { method: "POST", headers: { "content-type": "application/json", origin: server.origin }, body: body() });
  const first = request();
  await started;
  assert.equal((await request()).status, 429);
  assert.equal(calls, 1);
  release();
  assert.equal((await first).status, 200);
});

test("maps body limits, timeouts, response limits, and private runner failures to bounded codes", async (t) => {
  const rootDirectory = await fixtureRoot();
  const cases = [
    { options: { bodyLimitBytes: 32, runner: async () => "x" }, expected: [413, "body_too_large"] },
    { options: { timeoutMs: 10, runner: async (_prompt: string, signal: AbortSignal) => { await new Promise<void>((_resolve, reject) => signal.addEventListener("abort", () => reject(new Error("aborted")), { once: true })); return "x"; } }, expected: [504, "upstream_timeout"] },
    { options: { runner: async () => "塔".repeat(70_000) }, expected: [502, "response_too_large"] },
    { options: { runner: async () => { throw new Error("private-sdk-sentinel"); } }, expected: [502, "upstream_failed"] },
  ] as const;
  for (const item of cases) {
    const server = await startLocalServer({ rootDirectory, port: 0, ...item.options });
    t.after(server.close);
    const response = await fetch(`${server.origin}/v1/chat/completions`, { method: "POST", headers: { "content-type": "application/json", origin: server.origin }, body: body() });
    const text = await response.text();
    assert.equal(response.status, item.expected[0]);
    assert.match(text, new RegExp(item.expected[1]));
    assert.doesNotMatch(text, /private-sdk-sentinel/);
  }
});

function postUnfinishedChunk(server: LocalServer, chunk: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const socket = connect({ host: server.host, port: server.port });
    let response = "";
    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Error("raw client timed out"));
    }, 1_000);
    socket.setEncoding("utf8");
    socket.once("error", reject);
    socket.on("data", (value) => { response += value; });
    socket.once("close", () => {
      clearTimeout(timer);
      resolve(response);
    });
    socket.once("connect", () => {
      socket.write([
        "POST /v1/chat/completions HTTP/1.1",
        `Host: ${server.host}:${server.port}`,
        `Origin: ${server.origin}`,
        "Content-Type: application/json",
        "Transfer-Encoding: chunked",
        "Connection: keep-alive",
        "",
        chunk.length.toString(16),
        chunk,
        "",
      ].join("\r\n"));
    });
  });
}

test("returns 413 for an unfinished oversized chunk before EOF", async (t) => {
  const server = await startLocalServer({
    rootDirectory: await fixtureRoot(),
    port: 0,
    bodyLimitBytes: 32,
    runner: async () => "must not run",
  });
  t.after(server.close);
  const response = await postUnfinishedChunk(server, "x".repeat(33));
  assert.match(response, /HTTP\/1\.1 413/);
  assert.match(response, /body_too_large/);
});

test("bounds an unfinished in-limit body with the configured completion deadline", async (t) => {
  let calls = 0;
  const server = await startLocalServer({
    rootDirectory: await fixtureRoot(),
    port: 0,
    timeoutMs: 40,
    runner: async () => { calls += 1; return "must not run"; },
  });
  const client = await openUnfinishedBody(server);
  t.after(async () => {
    client.socket.destroy();
    await server.close();
  });
  const response = await within(client.closed, 1_000, "body_deadline");
  assert.match(response, /HTTP\/1\.1 504/);
  assert.match(response, /upstream_timeout/);
  assert.equal(calls, 0);
});

test("close promptly terminates an unfinished pre-run request and releases its port", async (t) => {
  let calls = 0;
  const server = await startLocalServer({
    rootDirectory: await fixtureRoot(),
    port: 0,
    timeoutMs: 10_000,
    runner: async () => { calls += 1; return "must not run"; },
  });
  const client = await openUnfinishedBody(server);
  t.after(async () => {
    client.socket.destroy();
    await server.close();
  });
  const busyResponse = await fetch(`${server.origin}/v1/chat/completions`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: server.origin },
    body: body(),
  });
  assert.equal(busyResponse.status, 429);
  await busyResponse.text();

  await within(server.close(), 1_000, "server_close");
  await within(client.closed, 1_000, "socket_close");
  assert.equal(client.socket.destroyed, true);
  assert.equal(calls, 0);

  await within(new Promise<void>((resolve, reject) => {
    const probe = connect({ host: server.host, port: server.port });
    probe.once("connect", () => {
      probe.destroy();
      reject(new Error("closed_port_accepted_connection"));
    });
    probe.once("error", () => resolve());
  }), 1_000, "closed_port_probe");

  const rebound = createNetServer();
  await within(new Promise<void>((resolve, reject) => {
    rebound.once("error", reject);
    rebound.listen(server.port, server.host, resolve);
  }), 1_000, "port_rebind");
  await within(new Promise<void>((resolve, reject) => {
    rebound.close((error) => error ? reject(error) : resolve());
  }), 1_000, "port_rebind_close");
});

test("aborts the runner when the browser disconnects", async (t) => {
  let markStarted!: () => void;
  let markAborted!: () => void;
  const started = new Promise<void>((resolve) => { markStarted = resolve; });
  const aborted = new Promise<void>((resolve) => { markAborted = resolve; });
  const server = await startLocalServer({
    rootDirectory: await fixtureRoot(),
    port: 0,
    runner: async (_prompt, signal) => {
      markStarted();
      await new Promise<void>((_resolve, reject) => {
        signal.addEventListener("abort", () => {
          markAborted();
          reject(new Error("aborted"));
        }, { once: true });
      });
      return "unreachable";
    },
  });
  t.after(server.close);
  const payload = body();
  const socket = connect({ host: server.host, port: server.port });
  await new Promise<void>((resolve, reject) => {
    socket.once("error", reject);
    socket.once("connect", () => {
      socket.write([
        "POST /v1/chat/completions HTTP/1.1",
        `Host: ${server.host}:${server.port}`,
        `Origin: ${server.origin}`,
        "Content-Type: application/json",
        `Content-Length: ${Buffer.byteLength(payload)}`,
        "Connection: close",
        "",
        payload,
      ].join("\r\n"));
      resolve();
    });
  });
  await started;
  socket.destroy();
  await aborted;
});
