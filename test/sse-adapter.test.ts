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
