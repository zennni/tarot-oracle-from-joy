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
