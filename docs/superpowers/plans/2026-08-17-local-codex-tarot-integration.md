# Local Codex Tarot Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a reusable loopback-only Codex service, one-click Windows launcher, and a first-class Local Codex option with a zero-model-call connection check to the Tarot Oracle website.

**Architecture:** A Node.js process serves the existing static site and an OpenAI-compatible endpoint from the same fixed loopback origin, `http://127.0.0.1:43127`. The browser reuses its existing SSE rendering path, while the server adapts messages to one tightly configured ChatGPT-authenticated Codex thread per request. Pure adapters, the persistent HTTP service, Codex/login integration, and browser configuration remain separate and independently testable.

**Tech Stack:** Node.js 18+, TypeScript, `@openai/codex-sdk` 0.147.0, Node's built-in HTTP and test modules, existing vanilla HTML/CSS/JavaScript.

## Global Constraints

- Production binds only the literal host `127.0.0.1` and fixed port `43127`; a port conflict fails clearly without choosing another production port.
- `GET /health` never creates a Codex thread or model request.
- Every accepted browser completion request creates at most one Codex thread; there is no retry or queue.
- At most one runner call may be active; concurrent requests return HTTP `429`.
- Request body limit is 128 KiB, combined prompt limit is 64 KiB, response limit is 64 KiB, and the upstream timeout is 120 seconds.
- Completion requests require `Host: 127.0.0.1:43127` and `Origin: http://127.0.0.1:43127` in production; no CORS permission is emitted.
- Only explicit frontend files and `牌面-*` / `打赏码` asset directories are served; internal code, Git data, docs, tests, and package metadata are never static routes.
- Codex receives no `OPENAI_API_KEY` or `CODEX_API_KEY`, uses `model_provider=openai`, `forced_login_method=chatgpt`, model `gpt-5.6-luna`, low reasoning, read-only sandbox, disabled tool network/web search, and approval policy `never`.
- Offline tests inject fake runners and command executors. No task in this plan authorizes a real model call.
- The existing providers, built-in oracle, settings import/export, and GitHub Pages behavior must remain functional.

---

## File Structure

- `.gitignore`: ignore dependency, runtime, and local subagent artifacts.
- `package.json`, `package-lock.json`, `tsconfig.json`: pin the local runtime and expose test/typecheck/start commands.
- `local-codex/request-adapter.ts`: validate OpenAI-compatible messages and build the bounded Codex prompt.
- `local-codex/sse-adapter.ts`: serialize one bounded response as an OpenAI-compatible SSE stream.
- `local-codex/server.ts`: serve whitelisted static assets, `/health`, and the persistent completion endpoint.
- `local-codex/codex-runner.ts`: construct the sanitized, fixed-policy Codex SDK client.
- `local-codex/login-status.ts`: run the bundled Codex CLI without a shell and require exact ChatGPT login output.
- `local-codex/launcher.ts`: create the empty runtime directory, start the server, open the browser, and clean up on exit.
- `local-codex-ui.js`: pure browser-side local-page detection, endpoint, and error-copy helpers.
- `start-local-codex.cmd`: double-click Windows entry point.
- `app.js`, `index.html`: add the Local Codex provider, connection check, field visibility, and error handling.
- `test/*.test.ts`: offline unit and integration coverage.
- `README.md`: local setup, use, safety boundary, and verification instructions.

---

### Task 1: Runtime foundation and protocol adapters

**Files:**
- Modify: `.gitignore`
- Create: `package.json`
- Create: `package-lock.json`
- Create: `tsconfig.json`
- Create: `local-codex/request-adapter.ts`
- Create: `local-codex/sse-adapter.ts`
- Create: `test/request-adapter.test.ts`
- Create: `test/sse-adapter.test.ts`

**Interfaces:**
- Consumes: Existing browser request shape `{ model, stream: true, messages: Array<{ role, content }> }`.
- Produces: `adaptChatCompletionRequest(input: unknown): { prompt: string }`, `RequestValidationError`, `MAX_PROMPT_BYTES`, `formatChatCompletionSse(content: string): string`, and `MAX_RESPONSE_BYTES`.

- [ ] **Step 1: Add the pinned Node project and ignore rules**

Create `.gitignore`:

```gitignore
.worktrees/
node_modules/
runtime/
.superpowers/
```

Create `package.json`:

```json
{
  "name": "tarot-oracle-local-codex",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "engines": { "node": ">=18" },
  "scripts": {
    "local": "tsx local-codex/launcher.ts",
    "test": "tsx --test \"test/**/*.test.ts\"",
    "typecheck": "tsc --noEmit",
    "check:web": "node --check app.js && node --check local-codex-ui.js",
    "verify": "npm test && npm run typecheck && npm run check:web"
  },
  "dependencies": {
    "@openai/codex-sdk": "0.147.0"
  },
  "devDependencies": {
    "@types/node": "24.13.3",
    "tsx": "4.23.12",
    "typescript": "7.0.2"
  }
}
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noEmit": true,
    "types": ["node"],
    "skipLibCheck": true
  },
  "include": ["local-codex/**/*.ts", "test/**/*.ts"]
}
```

Run: `npm install --package-lock-only`

Expected: `package-lock.json` is created with `lockfileVersion: 3` and exact top-level versions from `package.json`.

- [ ] **Step 2: Write failing request-adapter tests**

Create `test/request-adapter.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_PROMPT_BYTES,
  RequestValidationError,
  adaptChatCompletionRequest,
} from "../local-codex/request-adapter.js";

test("flattens supported messages in order and ignores the browser model", () => {
  const result = adaptChatCompletionRequest({
    model: "browser-model-is-ignored",
    stream: true,
    messages: [
      { role: "system", content: "保持温柔。" },
      { role: "user", content: "隐士正位意味着什么？" },
      { role: "assistant", content: "先前的解读。" },
    ],
  });
  assert.match(result.prompt, /只返回中文塔罗解读/);
  assert.ok(result.prompt.indexOf("[system]") < result.prompt.indexOf("[user]"));
  assert.ok(result.prompt.indexOf("[user]") < result.prompt.indexOf("[assistant]"));
  assert.doesNotMatch(result.prompt, /browser-model-is-ignored/);
});

for (const [name, input, code] of [
  ["requires an object body", null, "invalid_body"],
  ["requires streaming", { stream: false, messages: [{ role: "user", content: "x" }] }, "stream_required"],
  ["requires messages", { stream: true, messages: [] }, "invalid_messages"],
  ["rejects unsupported roles", { stream: true, messages: [{ role: "tool", content: "x" }] }, "invalid_message"],
  ["rejects empty content", { stream: true, messages: [{ role: "user", content: " " }] }, "invalid_message"],
] as const) {
  test(name, () => {
    assert.throws(
      () => adaptChatCompletionRequest(input),
      (error) => error instanceof RequestValidationError && error.code === code,
    );
  });
}

test("enforces the 64 KiB UTF-8 prompt limit", () => {
  const oversized = "塔".repeat(MAX_PROMPT_BYTES);
  assert.throws(
    () => adaptChatCompletionRequest({ stream: true, messages: [{ role: "user", content: oversized }] }),
    (error) => error instanceof RequestValidationError && error.code === "prompt_too_large",
  );
});
```

- [ ] **Step 3: Run the request tests and confirm the red state**

Run: `npm install && npm run test -- test/request-adapter.test.ts`

Expected: FAIL because `local-codex/request-adapter.ts` does not exist.

- [ ] **Step 4: Implement the bounded request adapter**

Create `local-codex/request-adapter.ts`:

```ts
import { Buffer } from "node:buffer";

export const MAX_PROMPT_BYTES = 64 * 1024;
const SUPPORTED_ROLES = new Set(["system", "user", "assistant"]);
const FIXED_INSTRUCTION = [
  "你只是一名简洁、温和的塔罗解读者。",
  "只返回中文塔罗解读，不解释系统规则。",
  "不得调用工具、读取或修改文件，也不得进行网页搜索。",
].join("");

export type RequestErrorCode =
  | "invalid_body"
  | "invalid_messages"
  | "invalid_message"
  | "stream_required"
  | "prompt_too_large";

export class RequestValidationError extends Error {
  constructor(readonly code: RequestErrorCode) {
    super(code);
    this.name = "RequestValidationError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function adaptChatCompletionRequest(input: unknown): { prompt: string } {
  if (!isRecord(input)) throw new RequestValidationError("invalid_body");
  if (input.stream !== true) throw new RequestValidationError("stream_required");
  if (!Array.isArray(input.messages) || input.messages.length === 0) {
    throw new RequestValidationError("invalid_messages");
  }
  const serialized = input.messages.map((message) => {
    if (
      !isRecord(message) ||
      typeof message.role !== "string" ||
      !SUPPORTED_ROLES.has(message.role) ||
      typeof message.content !== "string" ||
      message.content.trim().length === 0
    ) {
      throw new RequestValidationError("invalid_message");
    }
    return `[${message.role}]\n${message.content}`;
  });
  const prompt = `${FIXED_INSTRUCTION}\n\n${serialized.join("\n\n")}`;
  if (Buffer.byteLength(prompt, "utf8") > MAX_PROMPT_BYTES) {
    throw new RequestValidationError("prompt_too_large");
  }
  return { prompt };
}
```

- [ ] **Step 5: Write failing SSE tests**

Create `test/sse-adapter.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_RESPONSE_BYTES,
  ResponseValidationError,
  formatChatCompletionSse,
} from "../local-codex/sse-adapter.js";

test("emits one JSON-safe Chinese delta followed by DONE", () => {
  const body = formatChatCompletionSse("隐士说：\"慢下来\"。\n再观察。", 1700000000);
  const lines = body.split("\n").filter(Boolean);
  assert.equal(lines.length, 2);
  assert.equal(lines[1], "data: [DONE]");
  const event = JSON.parse(lines[0].slice("data: ".length));
  assert.equal(event.model, "gpt-5.6-luna");
  assert.equal(event.choices[0].delta.content, "隐士说：\"慢下来\"。\n再观察。");
});

test("rejects empty and oversized responses", () => {
  assert.throws(() => formatChatCompletionSse(" "), ResponseValidationError);
  assert.throws(
    () => formatChatCompletionSse("塔".repeat(MAX_RESPONSE_BYTES)),
    (error) => error instanceof ResponseValidationError && error.code === "response_too_large",
  );
});
```

- [ ] **Step 6: Run the SSE tests and confirm the red state**

Run: `npm run test -- test/sse-adapter.test.ts`

Expected: FAIL because `local-codex/sse-adapter.ts` does not exist.

- [ ] **Step 7: Implement the bounded SSE adapter**

Create `local-codex/sse-adapter.ts`:

```ts
import { Buffer } from "node:buffer";

export const FIXED_MODEL = "gpt-5.6-luna";
export const MAX_RESPONSE_BYTES = 64 * 1024;

export class ResponseValidationError extends Error {
  constructor(readonly code: "empty_response" | "response_too_large") {
    super(code);
    this.name = "ResponseValidationError";
  }
}

export function formatChatCompletionSse(
  content: string,
  created = Math.floor(Date.now() / 1000),
): string {
  if (content.trim().length === 0) throw new ResponseValidationError("empty_response");
  if (Buffer.byteLength(content, "utf8") > MAX_RESPONSE_BYTES) {
    throw new ResponseValidationError("response_too_large");
  }
  const event = {
    id: "tarot-local-codex",
    object: "chat.completion.chunk",
    created,
    model: FIXED_MODEL,
    choices: [{ index: 0, delta: { content }, finish_reason: null }],
  };
  return `data: ${JSON.stringify(event)}\n\ndata: [DONE]\n\n`;
}
```

- [ ] **Step 8: Verify and commit Task 1**

Run: `npm run test -- test/request-adapter.test.ts test/sse-adapter.test.ts && npm run typecheck`

Expected: all adapter tests PASS and `tsc --noEmit` exits 0.

```bash
git add .gitignore package.json package-lock.json tsconfig.json local-codex/request-adapter.ts local-codex/sse-adapter.ts test/request-adapter.test.ts test/sse-adapter.test.ts
git commit -m "feat: add local Codex protocol adapters"
```

---

### Task 2: Secure persistent loopback HTTP service

**Files:**
- Create: `local-codex/server.ts`
- Create: `test/server.test.ts`

**Interfaces:**
- Consumes: `adaptChatCompletionRequest`, `formatChatCompletionSse`, and `PromptRunner = (prompt: string, signal: AbortSignal) => Promise<string>`.
- Produces: `startLocalServer(options: StartLocalServerOptions): Promise<LocalServer>` where `LocalServer` exposes `{ host, port, origin, closed, close }`.

- [ ] **Step 1: Write failing HTTP integration tests**

Create `test/server.test.ts` with helpers that always set the server's returned `origin` as both URL and `Origin` header. Cover these exact cases:

```ts
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { startLocalServer } from "../local-codex/server.js";

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
```

Add `import { connect } from "node:net";` and change the server import to include `type LocalServer`. Append these exact regressions:

```ts
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
```

- [ ] **Step 2: Run the server tests and confirm the red state**

Run: `npm run test -- test/server.test.ts`

Expected: FAIL because `local-codex/server.ts` does not exist.

- [ ] **Step 3: Implement the persistent server**

Create `local-codex/server.ts` with this complete content:

```ts
import { Buffer } from "node:buffer";
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { readFile, realpath, stat } from "node:fs/promises";
import type { AddressInfo } from "node:net";
import { extname, isAbsolute, relative, resolve, sep } from "node:path";
import { adaptChatCompletionRequest, RequestValidationError } from "./request-adapter.js";
import { FIXED_MODEL, formatChatCompletionSse, ResponseValidationError } from "./sse-adapter.js";

export const LOCAL_HOST = "127.0.0.1" as const;
export const LOCAL_PORT = 43127;
export const DEFAULT_BODY_LIMIT_BYTES = 128 * 1024;
export const DEFAULT_TIMEOUT_MS = 120_000;

export type PromptRunner = (prompt: string, signal: AbortSignal) => Promise<string>;
export type StartLocalServerOptions = {
  rootDirectory: string;
  runner: PromptRunner;
  authCheck?: () => Promise<boolean>;
  port?: number;
  bodyLimitBytes?: number;
  timeoutMs?: number;
};
export type LocalServer = {
  host: typeof LOCAL_HOST;
  port: number;
  origin: string;
  closed: Promise<void>;
  close: () => Promise<void>;
};

class PublicHttpError extends Error {
  constructor(readonly status: number, readonly code: string) {
    super(code);
    this.name = "PublicHttpError";
  }
}

const ROOT_FILE_MIME = new Map([
  ["index.html", "text/html; charset=utf-8"],
  ["app.js", "text/javascript; charset=utf-8"],
  ["local-codex-ui.js", "text/javascript; charset=utf-8"],
  ["cards.js", "text/javascript; charset=utf-8"],
  ["waite.js", "text/javascript; charset=utf-8"],
  ["waite_cn.js", "text/javascript; charset=utf-8"],
  ["xyj_lore.js", "text/javascript; charset=utf-8"],
  ["html2canvas.min.js", "text/javascript; charset=utf-8"],
  ["manifest.json", "application/manifest+json; charset=utf-8"],
  ["icon-192.png", "image/png"],
  ["icon-512.png", "image/png"],
  ["og-cover.jpg", "image/jpeg"],
]);
const allowedAssetRoot = (segment: string) => segment.startsWith("牌面-") || segment === "打赏码";

const ASSET_MIME = new Map([
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
]);

function writeJsonBody(response: ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    connection: "close",
  });
  response.end(JSON.stringify(body));
}

function writeJson(response: ServerResponse, status: number, code: string): void {
  writeJsonBody(response, status, { error: { code } });
}

function classifyError(error: unknown): { status: number; code: string } {
  if (error instanceof PublicHttpError) return { status: error.status, code: error.code };
  if (error instanceof RequestValidationError) return { status: 400, code: error.code };
  if (error instanceof ResponseValidationError) return { status: 502, code: error.code };
  return { status: 500, code: "internal_error" };
}

function requestPath(rawUrl: string | undefined): string {
  try {
    const encoded = new URL(rawUrl ?? "/", "http://local.invalid").pathname;
    const decoded = decodeURIComponent(encoded);
    if (decoded.includes("\0") || decoded.includes("\\")) throw new Error("invalid_path");
    return decoded;
  } catch {
    throw new PublicHttpError(404, "not_found");
  }
}

function staysInside(root: string, candidate: string): boolean {
  const value = relative(root, candidate);
  return value !== "" && !value.startsWith(`..${sep}`) && value !== ".." && !isAbsolute(value);
}

async function staticCandidate(realRoot: string, pathname: string): Promise<{ path: string; mime: string }> {
  const relativeName = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const segments = relativeName.split("/");
  if (segments.some((segment) => !segment || segment === ".." || segment.startsWith("."))) {
    throw new PublicHttpError(404, "not_found");
  }
  const rootMime = segments.length === 1 ? ROOT_FILE_MIME.get(segments[0]) : undefined;
  const assetAllowed = segments.length > 1 && allowedAssetRoot(segments[0]);
  const mime = rootMime ?? (assetAllowed ? ASSET_MIME.get(extname(segments.at(-1) ?? "").toLowerCase()) : undefined);
  if (!mime) throw new PublicHttpError(404, "not_found");
  const candidate = resolve(realRoot, ...segments);
  if (!staysInside(realRoot, candidate)) throw new PublicHttpError(404, "not_found");
  let resolvedCandidate: string;
  try {
    resolvedCandidate = await realpath(candidate);
  } catch {
    throw new PublicHttpError(404, "not_found");
  }
  if (!staysInside(realRoot, resolvedCandidate) || !(await stat(resolvedCandidate)).isFile()) {
    throw new PublicHttpError(404, "not_found");
  }
  return { path: resolvedCandidate, mime };
}

async function readBoundedBody(request: IncomingMessage, limitBytes: number): Promise<string> {
  const chunks: Buffer[] = [];
  let bytes = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    bytes += buffer.length;
    if (bytes > limitBytes) {
      request.resume();
      throw new PublicHttpError(413, "body_too_large");
    }
    chunks.push(buffer);
  }
  return Buffer.concat(chunks).toString("utf8");
}

function closeServer(server: Server): Promise<void> {
  if (!server.listening) return Promise.resolve();
  return new Promise((resolvePromise, rejectPromise) => {
    server.close((error) => error ? rejectPromise(error) : resolvePromise());
  });
}

export async function startLocalServer(options: StartLocalServerOptions): Promise<LocalServer> {
  const realRoot = await realpath(options.rootDirectory);
  const bodyLimitBytes = options.bodyLimitBytes ?? DEFAULT_BODY_LIMIT_BYTES;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const authCheck = options.authCheck ?? (async () => true);
  const controllers = new Set<AbortController>();
  let busy = false;
  let actualPort = options.port ?? LOCAL_PORT;
  let origin = "";

  const handleCompletion = async (request: IncomingMessage, response: ServerResponse): Promise<void> => {
    busy = true;
    let runnerStarted = false;
    let timer: NodeJS.Timeout | undefined;
    let disconnected = false;
    let timedOut = false;
    try {
      const contentType = request.headers["content-type"] ?? "";
      if (!contentType.toLowerCase().startsWith("application/json")) {
        throw new PublicHttpError(415, "unsupported_media_type");
      }
      const rawBody = await readBoundedBody(request, bodyLimitBytes);
      let decoded: unknown;
      try { decoded = JSON.parse(rawBody); } catch { throw new PublicHttpError(400, "invalid_json"); }
      const { prompt } = adaptChatCompletionRequest(decoded);
      const controller = new AbortController();
      controllers.add(controller);
      const onDisconnect = (): void => {
        if (!response.writableEnded) {
          disconnected = true;
          controller.abort();
        }
      };
      request.once("aborted", onDisconnect);
      response.once("close", onDisconnect);
      const runnerPromise = Promise.resolve().then(() => options.runner(prompt, controller.signal));
      runnerStarted = true;
      void runnerPromise.then(
        () => { busy = false; controllers.delete(controller); },
        () => { busy = false; controllers.delete(controller); },
      );
      const timeout = new Promise<never>((_resolve, reject) => {
        timer = setTimeout(() => {
          timedOut = true;
          controller.abort();
          reject(new PublicHttpError(504, "upstream_timeout"));
        }, timeoutMs);
      });
      let content: string;
      try {
        content = await Promise.race([runnerPromise, timeout]);
      } catch (error) {
        if (timedOut) throw new PublicHttpError(504, "upstream_timeout");
        if (disconnected || response.destroyed) return;
        if (error instanceof PublicHttpError) throw error;
        throw new PublicHttpError(502, "upstream_failed");
      } finally {
        if (timer) clearTimeout(timer);
        request.off("aborted", onDisconnect);
        response.off("close", onDisconnect);
      }
      const sse = formatChatCompletionSse(content);
      response.writeHead(200, {
        "content-type": "text/event-stream; charset=utf-8",
        "cache-control": "no-store",
        connection: "close",
      });
      response.end(sse);
    } finally {
      if (!runnerStarted) busy = false;
    }
  };

  const dispatch = async (request: IncomingMessage, response: ServerResponse): Promise<void> => {
    try {
      if (request.headers.host !== `${LOCAL_HOST}:${actualPort}`) {
        throw new PublicHttpError(403, "invalid_host");
      }
      const pathname = requestPath(request.url);
      if (request.method === "GET" && pathname === "/health") {
        const authenticated = await authCheck();
        writeJsonBody(response, 200, {
          status: authenticated ? "ok" : "not_ready",
          auth: authenticated ? "chatgpt" : "required",
          model: FIXED_MODEL,
        });
        return;
      }
      if (request.method === "POST" && pathname === "/v1/chat/completions") {
        if (request.headers.origin !== origin) throw new PublicHttpError(403, "invalid_origin");
        if (busy) throw new PublicHttpError(429, "busy");
        if (!(await authCheck())) throw new PublicHttpError(503, "chatgpt_login_required");
        if (busy) throw new PublicHttpError(429, "busy");
        await handleCompletion(request, response);
        return;
      }
      if (request.method === "GET") {
        const file = await staticCandidate(realRoot, pathname);
        const content = await readFile(file.path);
        response.writeHead(200, {
          "content-type": file.mime,
          "content-length": content.length,
          "cache-control": "no-cache",
          connection: "close",
        });
        response.end(content);
        return;
      }
      throw new PublicHttpError(404, "not_found");
    } catch (error) {
      if (!response.headersSent && !response.destroyed) {
        const publicError = classifyError(error);
        writeJson(response, publicError.status, publicError.code);
      } else if (!response.destroyed) {
        response.end();
      }
    }
  };

  const server = createServer((request, response) => { void dispatch(request, response); });
  let markClosed!: () => void;
  const closed = new Promise<void>((resolvePromise) => { markClosed = resolvePromise; });
  server.once("close", markClosed);
  await new Promise<void>((resolvePromise, rejectPromise) => {
    const onError = (error: NodeJS.ErrnoException): void => {
      server.off("listening", onListening);
      rejectPromise(new Error(error.code === "EADDRINUSE" ? "port_in_use" : "listen_failed"));
    };
    const onListening = (): void => {
      server.off("error", onError);
      resolvePromise();
    };
    server.once("error", onError);
    server.once("listening", onListening);
    server.listen(actualPort, LOCAL_HOST);
  });
  const address = server.address();
  if (!address || typeof address === "string" || (address as AddressInfo).address !== LOCAL_HOST) {
    await closeServer(server);
    throw new Error("loopback_bind_failed");
  }
  actualPort = (address as AddressInfo).port;
  origin = `http://${LOCAL_HOST}:${actualPort}`;
  const close = async (): Promise<void> => {
    for (const controller of controllers) controller.abort();
    await closeServer(server);
  };
  return { host: LOCAL_HOST, port: actualPort, origin, closed, close };
}
```

- [ ] **Step 4: Verify and commit Task 2**

Run: `npm run test -- test/server.test.ts && npm run typecheck`

Expected: server tests PASS, including early 413 and disconnect cancellation; typecheck exits 0.

```bash
git add local-codex/server.ts test/server.test.ts
git commit -m "feat: add secure persistent local Codex server"
```

---

### Task 3: ChatGPT-authenticated runner and one-click launcher

**Files:**
- Create: `local-codex/codex-runner.ts`
- Create: `local-codex/login-status.ts`
- Create: `local-codex/launcher.ts`
- Create: `start-local-codex.cmd`
- Create: `test/codex-runner.test.ts`
- Create: `test/login-status.test.ts`
- Create: `test/launcher.test.ts`

**Interfaces:**
- Consumes: `PromptRunner`, `startLocalServer`, `FIXED_MODEL`, repository root and fixed local origin.
- Produces: `sanitizeEnvironment`, `createCodexRunner`, `isChatGptLoginOutput`, `assertChatGptLogin`, `runLauncher`, and the `npm run local` / Windows entry points.

- [ ] **Step 1: Write failing runner and login tests**

Create `test/codex-runner.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { createCodexRunner, sanitizeEnvironment } from "../local-codex/codex-runner.js";

test("removes API key variables without reading their values", () => {
  const environment: NodeJS.ProcessEnv = { SAFE_VALUE: "kept" };
  for (const name of ["OPENAI_API_KEY", "codex_api_key"]) {
    Object.defineProperty(environment, name, {
      enumerable: true,
      get: () => { throw new Error("secret getter was read"); },
    });
  }
  assert.deepEqual(sanitizeEnvironment(environment), { SAFE_VALUE: "kept" });
});

test("starts one fixed-policy thread and forwards the signal", async () => {
  const runtimeDirectory = "C:\\empty-runtime";
  let clientOptions: unknown;
  let threadOptions: unknown;
  let receivedSignal: AbortSignal | undefined;
  const runner = createCodexRunner({
    runtimeDirectory,
    environment: { SAFE_VALUE: "kept", OPENAI_API_KEY: "blocked" },
    createClient: async (options) => {
      clientOptions = options;
      return {
        startThread(options) {
          threadOptions = options;
          return {
            async run(_prompt, runOptions) {
              receivedSignal = runOptions.signal;
              return { finalResponse: "保持安静，答案会浮现。" };
            },
          };
        },
      };
    },
  });
  const controller = new AbortController();
  assert.equal(await runner("prompt", controller.signal), "保持安静，答案会浮现。");
  assert.deepEqual(clientOptions, {
    env: { SAFE_VALUE: "kept" },
    config: { model_provider: "openai", forced_login_method: "chatgpt" },
  });
  assert.deepEqual(threadOptions, {
    model: "gpt-5.6-luna",
    sandboxMode: "read-only",
    workingDirectory: runtimeDirectory,
    skipGitRepoCheck: true,
    modelReasoningEffort: "low",
    networkAccessEnabled: false,
    webSearchMode: "disabled",
    approvalPolicy: "never",
  });
  assert.equal(receivedSignal, controller.signal);
});

test("rejects an empty final response", async () => {
  const runner = createCodexRunner({
    runtimeDirectory: "C:\\empty-runtime",
    createClient: async () => ({
      startThread: () => ({ run: async () => ({ finalResponse: " " }) }),
    }),
  });
  await assert.rejects(() => runner("prompt", new AbortController().signal), /empty_codex_response/);
});
```

Create `test/login-status.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { assertChatGptLogin, isChatGptLoginOutput } from "../local-codex/login-status.js";

test("recognizes only exact ChatGPT login output", () => {
  assert.equal(isChatGptLoginOutput("Logged in using ChatGPT\r\n"), true);
  assert.equal(isChatGptLoginOutput("prefix Logged in using ChatGPT suffix"), false);
  assert.equal(isChatGptLoginOutput("Logged in using API key"), false);
});

test("checks the bundled CLI through node without a shell", async () => {
  const seen: unknown[] = [];
  await assertChatGptLogin(async (file, args, options) => {
    seen.push(file, args, options);
    return { stdout: "Logged in using ChatGPT\n", stderr: "" };
  });
  assert.equal(seen[0], process.execPath);
  assert.deepEqual((seen[1] as string[]).slice(-2), ["login", "status"]);
  assert.equal((seen[2] as { shell: boolean }).shell, false);
});

test("fails closed for any other status", async () => {
  await assert.rejects(
    () => assertChatGptLogin(async () => ({ stdout: "Logged in using API key", stderr: "" })),
    /chatgpt_login_required/,
  );
});
```

- [ ] **Step 2: Run runner/login tests and confirm the red state**

Run: `npm run test -- test/codex-runner.test.ts test/login-status.test.ts`

Expected: FAIL because the runner and login modules do not exist.

- [ ] **Step 3: Implement the fixed Codex runner**

Create `local-codex/codex-runner.ts`:

```ts
import type { PromptRunner } from "./server.js";
import { FIXED_MODEL } from "./sse-adapter.js";

type ClientOptions = {
  env: Record<string, string>;
  config: { model_provider: "openai"; forced_login_method: "chatgpt" };
};
type ThreadOptions = {
  model: string;
  sandboxMode: "read-only";
  workingDirectory: string;
  skipGitRepoCheck: true;
  modelReasoningEffort: "low";
  networkAccessEnabled: false;
  webSearchMode: "disabled";
  approvalPolicy: "never";
};
type ThreadLike = {
  run(prompt: string, options: { signal: AbortSignal }): Promise<{ finalResponse: string }>;
};
type CodexLike = { startThread(options: ThreadOptions): ThreadLike };
type CodexConstructor = new (options: ClientOptions) => CodexLike;
type CodexModule = { Codex: CodexConstructor };
export type CodexFactory = (options: ClientOptions) => CodexLike | Promise<CodexLike>;

const BLOCKED_KEYS = new Set(["OPENAI_API_KEY", "CODEX_API_KEY"]);

export function sanitizeEnvironment(environment: NodeJS.ProcessEnv): Record<string, string> {
  const sanitized: Record<string, string> = {};
  for (const key of Object.keys(environment)) {
    if (BLOCKED_KEYS.has(key.toUpperCase())) continue;
    const value = environment[key];
    if (value !== undefined) sanitized[key] = value;
  }
  return sanitized;
}

async function loadCodexConstructor(): Promise<CodexConstructor> {
  const module = await import("@openai/" + "codex-sdk") as CodexModule;
  if (typeof module.Codex !== "function") throw new Error("codex_constructor_unavailable");
  return module.Codex;
}

const defaultCreateClient: CodexFactory = async (options) => {
  const Codex = await loadCodexConstructor();
  return new Codex(options);
};

export function createCodexRunner(options: {
  runtimeDirectory: string;
  environment?: NodeJS.ProcessEnv;
  createClient?: CodexFactory;
}): PromptRunner {
  const environment = options.environment ?? process.env;
  const createClient = options.createClient ?? defaultCreateClient;
  return async (prompt, signal) => {
    const client = await createClient({
      env: sanitizeEnvironment(environment),
      config: { model_provider: "openai", forced_login_method: "chatgpt" },
    });
    const thread = client.startThread({
      model: FIXED_MODEL,
      sandboxMode: "read-only",
      workingDirectory: options.runtimeDirectory,
      skipGitRepoCheck: true,
      modelReasoningEffort: "low",
      networkAccessEnabled: false,
      webSearchMode: "disabled",
      approvalPolicy: "never",
    });
    const result = await thread.run(prompt, { signal });
    if (typeof result.finalResponse !== "string" || result.finalResponse.trim().length === 0) {
      throw new Error("empty_codex_response");
    }
    return result.finalResponse;
  };
}
```

- [ ] **Step 4: Implement the no-shell login check**

Create `local-codex/login-status.ts`:

```ts
import { execFile } from "node:child_process";
import { createRequire } from "node:module";

type Result = { stdout: string; stderr: string };
export type CommandRunner = (
  file: string,
  args: string[],
  options: { encoding: "utf8"; timeout: number; windowsHide: true; shell: false },
) => Promise<Result>;

const require = createRequire(import.meta.url);

export function isChatGptLoginOutput(output: string): boolean {
  return output.trim() === "Logged in using ChatGPT";
}

const runFile: CommandRunner = (file, args, options) =>
  new Promise((resolve, reject) => {
    execFile(file, args, options, (error, stdout, stderr) => {
      if (error) return reject(new Error("login_status_command_failed"));
      resolve({ stdout, stderr });
    });
  });

export async function assertChatGptLogin(run: CommandRunner = runFile): Promise<void> {
  const codexEntry = require.resolve("@openai/codex/bin/codex.js");
  const result = await run(process.execPath, [codexEntry, "login", "status"], {
    encoding: "utf8",
    timeout: 15_000,
    windowsHide: true,
    shell: false,
  });
  if (!isChatGptLoginOutput(result.stdout + result.stderr)) {
    throw new Error("chatgpt_login_required");
  }
}
```

- [ ] **Step 5: Write failing launcher tests**

Create `test/launcher.test.ts`:

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { runLauncher, type LauncherDependencies } from "../local-codex/launcher.js";

function fixture(events: string[]): LauncherDependencies {
  let markClosed!: () => void;
  const closed = new Promise<void>((resolve) => { markClosed = resolve; });
  return {
    checkLogin: async () => { events.push("login"); },
    makeRuntime: async () => { events.push("mkdtemp"); return "C:\\temp\\tarot-runtime"; },
    removeRuntime: async (path) => { events.push(`remove:${path}`); },
    createRunner: (path) => { events.push(`runner:${path}`); return async () => "fake"; },
    startServer: async () => {
      events.push("server");
      return {
        host: "127.0.0.1",
        port: 43127,
        origin: "http://127.0.0.1:43127",
        closed,
        close: async () => { events.push("close"); markClosed(); },
      };
    },
    openBrowser: async () => { events.push("open"); },
    log: (line) => { events.push(`log:${line}`); },
  };
}

test("starts in order, honors no-open, and cleans up exactly once", async () => {
  const events: string[] = [];
  const handle = await runLauncher({ noOpen: true, dependencies: fixture(events) });
  assert.deepEqual(events.slice(0, 5), [
    "login",
    "mkdtemp",
    "runner:C:\\temp\\tarot-runtime",
    "server",
    "log:local_codex_ready=http://127.0.0.1:43127",
  ]);
  assert.equal(events.includes("open"), false);
  await handle.stop();
  await handle.stop();
  assert.equal(events.filter((event) => event === "close").length, 1);
  assert.equal(events.filter((event) => event.startsWith("remove:")).length, 1);
});

test("login failure prevents runtime and server creation", async () => {
  const events: string[] = [];
  const dependencies = fixture(events);
  dependencies.checkLogin = async () => { throw new Error("chatgpt_login_required"); };
  await assert.rejects(() => runLauncher({ noOpen: true, dependencies }), /chatgpt_login_required/);
  assert.deepEqual(events, []);
});

test("browser-open failure is nonfatal and prints the manual URL", async () => {
  const events: string[] = [];
  const dependencies = fixture(events);
  dependencies.openBrowser = async () => { throw new Error("open_failed"); };
  const handle = await runLauncher({ dependencies });
  assert.ok(events.includes("log:open_manually=http://127.0.0.1:43127"));
  await handle.stop();
});

test("server startup failure removes only the created runtime", async () => {
  const events: string[] = [];
  const dependencies = fixture(events);
  dependencies.startServer = async () => { throw new Error("port_in_use"); };
  await assert.rejects(() => runLauncher({ noOpen: true, dependencies }), /port_in_use/);
  assert.deepEqual(events.filter((event) => event.startsWith("remove:")), ["remove:C:\\temp\\tarot-runtime"]);
});
```

- [ ] **Step 6: Implement the launcher and Windows entry point**

Create `local-codex/launcher.ts`:

```ts
import { execFile } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createCodexRunner } from "./codex-runner.js";
import { assertChatGptLogin } from "./login-status.js";
import { startLocalServer, type LocalServer, type PromptRunner } from "./server.js";

const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export type LauncherDependencies = {
  checkLogin: () => Promise<void>;
  makeRuntime: () => Promise<string>;
  removeRuntime: (path: string) => Promise<void>;
  createRunner: (runtimeDirectory: string) => PromptRunner;
  startServer: (options: {
    rootDirectory: string;
    runner: PromptRunner;
    authCheck: () => Promise<boolean>;
  }) => Promise<LocalServer>;
  openBrowser: (url: string) => Promise<void>;
  log: (line: string) => void;
};

function exec(file: string, args: string[]): Promise<void> {
  return new Promise((resolvePromise, rejectPromise) => {
    execFile(file, args, { windowsHide: true, shell: false }, (error) => {
      if (error) rejectPromise(new Error("open_failed"));
      else resolvePromise();
    });
  });
}

async function openBrowser(url: string): Promise<void> {
  if (process.platform === "win32") return exec("rundll32.exe", ["url.dll,FileProtocolHandler", url]);
  if (process.platform === "darwin") return exec("open", [url]);
  return exec("xdg-open", [url]);
}

const defaults: LauncherDependencies = {
  checkLogin: assertChatGptLogin,
  makeRuntime: () => mkdtemp(join(tmpdir(), "tarot-local-codex-")),
  removeRuntime: (path) => rm(path, { recursive: true, force: true }),
  createRunner: (runtimeDirectory) => createCodexRunner({ runtimeDirectory }),
  startServer: (options) => startLocalServer(options),
  openBrowser,
  log: console.log,
};

export async function runLauncher(options: {
  noOpen?: boolean;
  dependencies?: LauncherDependencies;
} = {}): Promise<{ origin: string; closed: Promise<void>; stop: () => Promise<void> }> {
  const dependencies = options.dependencies ?? defaults;
  await dependencies.checkLogin();
  const runtimeDirectory = await dependencies.makeRuntime();
  let server: LocalServer;
  try {
    const runner = dependencies.createRunner(runtimeDirectory);
    const authCheck = async (): Promise<boolean> => {
      try { await dependencies.checkLogin(); return true; }
      catch { return false; }
    };
    server = await dependencies.startServer({ rootDirectory: REPOSITORY_ROOT, runner, authCheck });
  } catch (error) {
    await dependencies.removeRuntime(runtimeDirectory);
    throw error;
  }
  dependencies.log(`local_codex_ready=${server.origin}`);
  if (!options.noOpen) {
    try { await dependencies.openBrowser(server.origin); }
    catch { dependencies.log(`open_manually=${server.origin}`); }
  }
  let stopPromise: Promise<void> | undefined;
  const cleanup = async (): Promise<void> => {
    await dependencies.removeRuntime(runtimeDirectory);
  };
  const closed = server.closed.then(cleanup);
  const stop = (): Promise<void> => {
    stopPromise ??= (async () => {
      await server.close();
      await closed;
    })();
    return stopPromise;
  };
  return { origin: server.origin, closed, stop };
}

function stableCode(error: unknown): string {
  const code = error instanceof Error ? error.message : "";
  return new Set([
    "chatgpt_login_required",
    "login_status_command_failed",
    "port_in_use",
    "listen_failed",
    "loopback_bind_failed",
  ]).has(code) ? code : "internal_error";
}

async function main(): Promise<void> {
  try {
    const handle = await runLauncher({ noOpen: process.argv.includes("--no-open") });
    let stopping = false;
    const stop = (): void => {
      if (stopping) return;
      stopping = true;
      void handle.stop().catch(() => { process.exitCode = 1; });
    };
    process.once("SIGINT", stop);
    process.once("SIGTERM", stop);
    await handle.closed;
  } catch (error) {
    console.error(`local_codex_start_failed=${stableCode(error)}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  void main();
}
```

Create `start-local-codex.cmd`:

```bat
@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 18 or newer is required.
  pause
  exit /b 1
)
node -e "process.exit(Number(process.versions.node.split('.')[0]) >= 18 ? 0 : 1)"
if errorlevel 1 (
  echo Node.js 18 or newer is required.
  pause
  exit /b 1
)
if not exist "node_modules\@openai\codex-sdk\package.json" (
  echo Installing pinned local dependencies...
  call npm ci
  if errorlevel 1 (
    echo Dependency installation failed.
    pause
    exit /b 1
  )
)
call npm run local
if errorlevel 1 pause
```

- [ ] **Step 7: Verify and commit Task 3**

Run: `npm run test -- test/codex-runner.test.ts test/login-status.test.ts test/launcher.test.ts && npm run typecheck`

Expected: all runner/login/launcher tests PASS and typecheck exits 0. These tests must not invoke the real CLI, browser, HTTP listener, or model.

```bash
git add local-codex/codex-runner.ts local-codex/login-status.ts local-codex/launcher.ts start-local-codex.cmd test/codex-runner.test.ts test/login-status.test.ts test/launcher.test.ts
git commit -m "feat: add ChatGPT-authenticated local Codex launcher"
```

---

### Task 4: First-class Local Codex website integration

**Files:**
- Create: `local-codex-ui.js`
- Modify: `index.html`
- Modify: `app.js`
- Create: `test/ui-helper.test.ts`
- Create: `test/web-integration.test.ts`

**Interfaces:**
- Consumes: Same-origin `/health` and `/v1/chat/completions`, existing `aiSettings`, `streamOpenAICompat`, `streamOpenAICompatMessages`, `notify`, and `t` translation helper.
- Produces: `globalThis.LocalCodexUI`, provider id `codex`, `checkLocalCodexConnection()`, and settings DOM ids `local-codex-section`, `local-codex-test`, and `local-codex-status`.

- [ ] **Step 1: Write failing pure UI-helper tests**

Create `test/ui-helper.test.ts`:

```ts
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import test from "node:test";

test("local UI helper allows only the fixed loopback page", async () => {
  delete (globalThis as { LocalCodexUI?: unknown }).LocalCodexUI;
  await import(`${pathToFileURL(resolve("local-codex-ui.js")).href}?test=${Date.now()}`);
  const api = (globalThis as typeof globalThis & { LocalCodexUI: {
    isLocalPage(location: { protocol: string; hostname: string; port: string }): boolean;
    chatUrl(location: { protocol: string; hostname: string; port: string }): string;
    healthUrl(location: { protocol: string; hostname: string; port: string }): string;
    errorText(code: string, language: "zh" | "en"): string;
  } }).LocalCodexUI;
  const local = { protocol: "http:", hostname: "127.0.0.1", port: "43127" };
  assert.equal(api.isLocalPage(local), true);
  assert.equal(api.chatUrl(local), "/v1/chat/completions");
  assert.equal(api.healthUrl(local), "/health");
  for (const remote of [
    { protocol: "https:", hostname: "example.github.io", port: "" },
    { protocol: "http:", hostname: "localhost", port: "43127" },
    { protocol: "http:", hostname: "127.0.0.1", port: "9999" },
  ]) {
    assert.equal(api.isLocalPage(remote), false);
    assert.equal(api.chatUrl(remote), "");
  }
  assert.match(api.errorText("busy", "zh"), /正在处理/);
  assert.match(api.errorText("upstream_timeout", "en"), /timed out/i);
  assert.match(api.errorText("local_page_required", "zh"), /本地启动器/);
});
```

- [ ] **Step 2: Run the helper test and confirm the red state**

Run: `npm run test -- test/ui-helper.test.ts`

Expected: FAIL because `local-codex-ui.js` does not exist.

- [ ] **Step 3: Implement the pure browser helper**

Create `local-codex-ui.js` as a classic script that assigns one immutable object to `globalThis.LocalCodexUI`:

```js
(function (root) {
  'use strict';
  const TEXT = {
    local_page_required: { zh: '请运行本地启动器，并在它打开的页面中使用本地 Codex。', en: 'Run the local launcher and use Local Codex in the page it opens.' },
    busy: { zh: '本地 Codex 正在处理上一条请求，请稍后再试。', en: 'Local Codex is processing the previous request.' },
    upstream_timeout: { zh: '本地 Codex 响应超时，本次请求不会自动重试。', en: 'Local Codex timed out. This request will not be retried.' },
    upstream_failed: { zh: '本地 Codex 调用失败，请确认 ChatGPT 登录状态。', en: 'Local Codex failed. Check the ChatGPT login state.' },
    chatgpt_login_required: { zh: 'Codex 当前未使用 ChatGPT 登录，请先完成登录。', en: 'Codex is not signed in with ChatGPT.' },
    response_too_large: { zh: '本地 Codex 返回内容过长。', en: 'Local Codex returned too much text.' },
    unavailable: { zh: '本地 Codex 未启动或无法连接。', en: 'Local Codex is not running or cannot be reached.' },
  };
  function isLocalPage(location) {
    return location.protocol === 'http:' && location.hostname === '127.0.0.1' && location.port === '43127';
  }
  function chatUrl(location) { return isLocalPage(location) ? '/v1/chat/completions' : ''; }
  function healthUrl(location) { return isLocalPage(location) ? '/health' : ''; }
  function errorText(code, language) {
    const entry = TEXT[code] || TEXT.unavailable;
    return entry[language === 'zh' ? 'zh' : 'en'];
  }
  root.LocalCodexUI = Object.freeze({ isLocalPage, chatUrl, healthUrl, errorText });
})(globalThis);
```

- [ ] **Step 4: Write failing structural website tests**

Create `test/web-integration.test.ts`:

```ts
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

function count(source: string, marker: string): number {
  return [...source.matchAll(new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"))].length;
}

function assertIntegration(index: string, app: string): void {
  for (const marker of [
    '<option value="codex">',
    'id="local-codex-section"',
    'id="local-codex-test"',
    'id="local-codex-status"',
    '<script src="local-codex-ui.js"></script>',
  ]) assert.equal(count(index, marker), 1, marker);
  assert.ok(index.indexOf('local-codex-ui.js') < index.indexOf('app.js'));
  for (const marker of [
    "function checkLocalCodexConnection()",
    "LocalCodexUI.chatUrl(window.location)",
    "const isCodex = v === 'codex'",
    "aiSettings.engine === 'codex'",
    "LocalCodexUI.errorText('local_page_required', lang)",
  ]) assert.ok(count(app, marker) >= 1, marker);
}

test("contains every Local Codex integration marker exactly where required", async () => {
  const index = await readFile("index.html", "utf8");
  const app = await readFile("app.js", "utf8");
  assertIntegration(index, app);
});

test("fails when any non-first required marker is removed", async () => {
  const index = await readFile("index.html", "utf8");
  const app = await readFile("app.js", "utf8");
  const mutations: Array<[string, string, "index" | "app"]> = [
    ['id="local-codex-status"', 'id="removed-status"', "index"],
    ['<script src="local-codex-ui.js"></script>', '<script src="removed.js"></script>', "index"],
    ["LocalCodexUI.chatUrl(window.location)", "removedChatUrl()", "app"],
    ["LocalCodexUI.errorText('local_page_required', lang)", "removedErrorText()", "app"],
  ];
  for (const [from, to, target] of mutations) {
    assert.throws(() => assertIntegration(
      target === "index" ? index.replace(from, to) : index,
      target === "app" ? app.replace(from, to) : app,
    ));
  }
});
```

- [ ] **Step 5: Add the settings UI**

Modify `index.html`:

1. Add `<option value="codex">本地 Codex（ChatGPT 登录）</option>` immediately after the built-in oracle option.
2. Add this block after the custom URL section and before the API key section:

```html
<div id="local-codex-section" style="display:none;margin:.8rem 0">
  <button type="button" class="modal-save-btn" id="local-codex-test" onclick="checkLocalCodexConnection()">
    检测本地 Codex
  </button>
  <div class="modal-hint" id="local-codex-status" aria-live="polite">
    连接检测不会调用模型或消耗额度。
  </div>
</div>
```

3. Load `<script src="local-codex-ui.js"></script>` immediately before `<script src="app.js"></script>`.

- [ ] **Step 6: Wire Local Codex into existing browser flows**

Modify `app.js` with these exact behaviors:

```js
// AI_PROVIDERS addition
codex: { label: '本地 Codex（ChatGPT 登录）', url: '', model: 'gpt-5.6-luna' },

// First branch in resolveEndpoint
if (aiSettings.engine === 'codex') {
  return { url: LocalCodexUI.chatUrl(window.location), model: 'gpt-5.6-luna' };
}
```

Replace `onEngineChange` visibility logic with:

```js
const isBuiltin = v === 'builtin';
const isCustom = v === 'custom';
const isCodex = v === 'codex';
document.getElementById('api-key-section').style.display = (isBuiltin || isCodex) ? 'none' : 'block';
document.getElementById('model-section').style.display = (isBuiltin || isCustom || isCodex) ? 'none' : 'block';
document.getElementById('api-url-section').style.display = isCustom ? 'block' : 'none';
document.getElementById('custom-model-section').style.display = (isBuiltin || isCodex) ? 'none' : 'block';
document.getElementById('local-codex-section').style.display = isCodex ? 'block' : 'none';
if (!isBuiltin && !isCustom && !isCodex) populateModelSelect(v);
```

Add:

```js
async function checkLocalCodexConnection() {
  const status = document.getElementById('local-codex-status');
  const url = LocalCodexUI.healthUrl(window.location);
  if (!url) {
    status.textContent = LocalCodexUI.errorText('local_page_required', lang);
    return;
  }
  status.textContent = t('Checking local service…', '正在检测本地服务…');
  try {
    const response = await fetch(url, { cache: 'no-store' });
    const body = await response.json();
    if (body.auth === 'required') {
      status.textContent = LocalCodexUI.errorText('chatgpt_login_required', lang);
      return;
    }
    if (!response.ok || body.status !== 'ok' || body.auth !== 'chatgpt') throw new Error('not_ready');
    status.textContent = t(`Connected · ${body.model}`, `已连接 · ${body.model}`);
  } catch {
    status.textContent = LocalCodexUI.errorText('unavailable', lang);
  }
}
```

Add these helpers immediately before `streamOpenAICompat`:

```js
function openAICompatHeaders(apiKey) {
  const headers = { 'content-type': 'application/json' };
  if (apiKey) headers.Authorization = 'Bearer ' + apiKey;
  return headers;
}

async function fetchOpenAICompat(url, options) {
  try {
    return await fetch(url, options);
  } catch (error) {
    if (aiSettings.engine === 'codex') {
      throw new Error(LocalCodexUI.errorText('unavailable', lang));
    }
    throw error;
  }
}

async function openAICompatResponseError(response) {
  if (aiSettings.engine === 'codex') {
    let code = 'upstream_failed';
    try {
      const payload = await response.clone().json();
      if (typeof payload?.error?.code === 'string') code = payload.error.code;
    } catch {}
    return new Error(LocalCodexUI.errorText(code, lang));
  }
  return new Error(`${response.status}: ${await response.text()}`);
}
```

In both `streamOpenAICompat` and `streamOpenAICompatMessages`, replace direct `fetch` with `fetchOpenAICompat`, use `headers: openAICompatHeaders(apiKey)`, and replace non-OK handling with `throw await openAICompatResponseError(res)`.

Before both summary and follow-up calls, if `aiSettings.engine === 'codex'` and `resolveEndpoint().url` is empty, throw `new Error(LocalCodexUI.errorText('local_page_required', lang))`. In `sendChat`'s catch block, show `escapeHtml(err.message)` for Local Codex and retain the existing API-key wording for all other providers.

Add `codex: '本地 Codex'` to the chat provider label map. In `applyLang`, translate the test button and reset its idle hint. In `saveSettings`, always save engine and persona, but update `apiKey`, `model`, `apiUrl`, and `customModel` only when the selected engine is not `codex`; this preserves the user's prior provider settings without using or displaying them in Local Codex mode.

- [ ] **Step 7: Verify and commit Task 4**

Run: `npm run test -- test/ui-helper.test.ts test/web-integration.test.ts && npm run check:web && npm run typecheck`

Expected: helper and structural tests PASS, both browser scripts parse, and typecheck exits 0.

```bash
git add local-codex-ui.js index.html app.js test/ui-helper.test.ts test/web-integration.test.ts
git commit -m "feat: add Local Codex website option"
```

---

### Task 5: Documentation and complete offline acceptance

**Files:**
- Create: `README.md`
- Modify: `package.json`
- Test: all `test/**/*.test.ts`

**Interfaces:**
- Consumes: all earlier commands and the fixed local URL.
- Produces: a reproducible local-use SOP and fresh offline acceptance evidence without a model request.

- [ ] **Step 1: Write the user-facing local SOP**

Create `README.md` with these sections and exact operational facts:

````markdown
# Tarot Oracle

## 本地 Codex 使用

前提：Windows 已安装 Node.js 18+，Codex 已执行 ChatGPT 登录。

最简单的启动方式是双击 `start-local-codex.cmd`。首次启动会按锁文件安装依赖；随后服务只监听 `http://127.0.0.1:43127` 并自动打开本地网页。

也可以运行：

```powershell
npm ci
npm run local
```

在设置中选择“本地 Codex（ChatGPT 登录）”，点击“检测本地 Codex”。检测只访问 `/health`，不会调用模型。生成解读或追问才会各自发起一次 Codex 请求，失败不会自动重试。

## 离线验证

```powershell
npm run verify
```

测试使用假 runner，不调用模型。

## 边界

本地 Codex 服务不是公网或局域网中转站，不导出 ChatGPT Pro 余额，不提供通用 OpenAI API 权益，也不能显示一次请求具体扣减了多少额度。线上 GitHub Pages 继续支持原有 provider；本地 Codex 只能在启动器打开的回环页面中使用。
````

- [ ] **Step 2: Add a single offline gate command**

Keep `verify` as `npm test && npm run typecheck && npm run check:web`. Do not add a live test to `npm test`, `verify`, install scripts, launcher startup, or health check.

- [ ] **Step 3: Run the full offline gate from a clean dependency install**

Run:

```powershell
npm ci
npm run verify
```

Expected: every test passes, TypeScript exits 0, both browser scripts parse, no Codex thread is created, and Git shows only the intended README/package changes before commit.

- [ ] **Step 4: Perform a no-model local readiness check**

Run `npm run local -- --no-open` in a controlled background process. Wait only for `local_codex_ready=http://127.0.0.1:43127`, then request `GET http://127.0.0.1:43127/health` and assert the exact JSON fields `{ status: "ok", auth: "chatgpt", model: "gpt-5.6-luna" }`. Request `/` and assert HTTP 200. Stop the process, then verify port 43127 is closed. Do not POST `/v1/chat/completions`.

- [ ] **Step 5: Commit Task 5**

```bash
git add README.md package.json package-lock.json
git commit -m "docs: add local Codex startup and verification guide"
```

- [ ] **Step 6: Final review and live-test gate**

Review the complete branch against `docs/superpowers/specs/2026-08-17-local-codex-tarot-integration-design.md`. Re-run `npm run verify`, confirm the branch and original PoC repository are clean, and report offline evidence. Then stop and ask for explicit authorization for exactly one real browser completion request with no retry. Do not claim end-to-end model success until that separate call returns SSE `[DONE]` with non-empty Chinese text.
