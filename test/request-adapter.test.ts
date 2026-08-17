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
