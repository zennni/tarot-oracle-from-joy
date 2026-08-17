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
