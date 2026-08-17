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
    try {
      await dependencies.removeRuntime(runtimeDirectory);
    } catch {
      dependencies.log("runtime_cleanup_failed");
    }
    throw error;
  }
  dependencies.log(`local_codex_ready=${server.origin}`);
  if (!options.noOpen) {
    try { await dependencies.openBrowser(server.origin); }
    catch { dependencies.log(`open_manually=${server.origin}`); }
  }
  let cleanupPromise: Promise<void> | undefined;
  const cleanup = (): Promise<void> => {
    cleanupPromise ??= dependencies.removeRuntime(runtimeDirectory);
    return cleanupPromise;
  };
  const closed = server.closed.then(cleanup);
  let stopPromise: Promise<void> | undefined;
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
