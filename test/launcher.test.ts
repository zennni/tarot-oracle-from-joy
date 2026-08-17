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

test("preserves the startup error when runtime cleanup fails", async () => {
  const events: string[] = [];
  const dependencies = fixture(events);
  dependencies.startServer = async () => { throw new Error("port_in_use"); };
  dependencies.removeRuntime = async (path) => {
    events.push(`remove:${path}`);
    throw new Error("cleanup_failed");
  };
  await assert.rejects(
    () => runLauncher({ noOpen: true, dependencies }),
    (error: unknown) => error instanceof Error && error.message === "port_in_use",
  );
  assert.deepEqual(events.filter((event) => event.startsWith("remove:")), ["remove:C:\\temp\\tarot-runtime"]);
  assert.ok(events.includes("log:runtime_cleanup_failed"));
  assert.equal(events.includes("log:cleanup_failed"), false);
});
