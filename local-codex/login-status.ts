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
  new Promise((resolvePromise, rejectPromise) => {
    execFile(file, args, options, (error, stdout, stderr) => {
      if (error) return rejectPromise(new Error("login_status_command_failed"));
      resolvePromise({ stdout, stderr });
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
