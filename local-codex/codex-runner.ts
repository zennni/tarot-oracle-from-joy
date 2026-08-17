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
