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
