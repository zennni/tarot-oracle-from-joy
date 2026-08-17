import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

function count(source: string, marker: string): number {
  return [...source.matchAll(new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"))].length;
}

async function readSource(path: string): Promise<string> {
  return (await readFile(path, "utf8")).replace(/\r\n?/g, "\n");
}

function functionBounds(source: string, name: string): { start: number; end: number } {
  const marker = `function ${name}(`;
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, marker);
  const next = source.slice(start + marker.length).search(/\n(?:async )?function \w+\(/);
  return { start, end: next === -1 ? source.length : start + marker.length + next };
}

function functionRegion(source: string, name: string): string {
  const { start, end } = functionBounds(source, name);
  return source.slice(start, end);
}

function replaceInFunction(source: string, name: string, from: string, to: string): string {
  const { start, end } = functionBounds(source, name);
  const region = source.slice(start, end);
  assert.ok(region.includes(from), `${name}: ${from}`);
  return source.slice(0, start) + region.replace(from, to) + source.slice(end);
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
  ]) assert.ok(count(app, marker) >= 1, marker);
}

function assertRequestIntegration(app: string): void {
  const guard = "if (isCodexRequest && !url) throw new Error(LocalCodexUI.errorText('local_page_required', lang));";

  const summary = functionRegion(app, "streamAIResponse");
  assert.equal(count(summary, "const isCodexRequest = aiSettings.engine === 'codex';"), 1);
  assert.equal(count(summary, guard), 1);
  assert.equal(count(summary, "const requestApiKey = isCodexRequest ? '' : aiSettings.apiKey;"), 1);
  assert.equal(count(summary, "streamOpenAICompat(url, model, requestApiKey, prompt, el, onDone, isCodexRequest)"), 1);
  const summaryCatch = summary.slice(summary.indexOf("} catch (err) {"));
  assert.equal(count(summaryCatch, "resolveEndpoint()"), 0);
  assert.ok(summaryCatch.includes("const hint = isCodexRequest\n      ? ''\n      : aiSettings.engine === 'custom'"));
  assert.ok(summaryCatch.includes("const errorMessage = isCodexRequest\n      ? escapeHtml(err.message"));

  const followUp = functionRegion(app, "streamChatAI");
  assert.ok(followUp.startsWith("function streamChatAI(history, el, isCodexRequest)"));
  assert.equal(count(followUp, guard), 1);
  assert.equal(count(followUp, "const requestApiKey = isCodexRequest ? '' : aiSettings.apiKey;"), 1);
  assert.equal(count(followUp, "streamOpenAICompatMessages(url, model, requestApiKey, msgs, el, isCodexRequest)"), 1);
  assert.equal(count(followUp, "aiSettings.engine === 'codex'"), 0);

  const sendChat = functionRegion(app, "sendChat");
  assert.equal(count(sendChat, "const isCodexRequest = aiSettings.engine === 'codex';"), 1);
  assert.equal(count(sendChat, "streamChatAI(chatHistory, div, isCodexRequest)"), 1);
  assert.ok(sendChat.indexOf("const isCodexRequest") < sendChat.indexOf("await "));
  const sendCatch = sendChat.slice(sendChat.indexOf("} catch (err) {"));
  assert.ok(sendCatch.includes("const errorMessage = isCodexRequest\n        ? escapeHtml(err.message"));

  const fetchWrapper = functionRegion(app, "fetchOpenAICompat");
  assert.ok(fetchWrapper.startsWith("function fetchOpenAICompat(url, options, isCodexRequest)"));
  assert.ok(fetchWrapper.includes("if (isCodexRequest)"));
  assert.equal(count(fetchWrapper, "aiSettings.engine"), 0);

  const responseMapper = functionRegion(app, "openAICompatResponseError");
  assert.ok(responseMapper.startsWith("function openAICompatResponseError(response, isCodexRequest)"));
  assert.ok(responseMapper.includes("if (isCodexRequest)"));
  assert.equal(count(responseMapper, "aiSettings.engine"), 0);

  for (const name of ["streamOpenAICompat", "streamOpenAICompatMessages"]) {
    const transport = functionRegion(app, name);
    assert.ok(transport.includes("isCodexRequest)"), `${name}: immutable parameter`);
    assert.ok(transport.includes("fetchOpenAICompat(url, {"), `${name}: fetch wrapper`);
    assert.ok(transport.includes("}, isCodexRequest)"), `${name}: fetch context`);
    assert.ok(transport.includes("openAICompatResponseError(res, isCodexRequest)"), `${name}: response context`);
    assert.equal(count(transport, "aiSettings.engine"), 0);
  }
}

test("contains every Local Codex integration marker exactly where required", async () => {
  const index = await readSource("index.html");
  const app = await readSource("app.js");
  assertIntegration(index, app);
});

test("fails when any required page marker is removed", async () => {
  const index = await readSource("index.html");
  const app = await readSource("app.js");
  const mutations: Array<[string, string, "index" | "app"]> = [
    ['id="local-codex-status"', 'id="removed-status"', "index"],
    ['<script src="local-codex-ui.js"></script>', '<script src="removed.js"></script>', "index"],
    ["LocalCodexUI.chatUrl(window.location)", "removedChatUrl()", "app"],
  ];
  for (const [from, to, target] of mutations) {
    assert.throws(() => assertIntegration(
      target === "index" ? index.replace(from, to) : index,
      target === "app" ? app.replace(from, to) : app,
    ));
  }
});

test("scopes immutable Local Codex context to summary, follow-up, transport, and rendering", async () => {
  const app = await readSource("app.js");
  assertRequestIntegration(app);
});

test("fails when only one request path or rendering catch loses Local Codex handling", async () => {
  const app = await readSource("app.js");
  const guard = "if (isCodexRequest && !url) throw new Error(LocalCodexUI.errorText('local_page_required', lang));";
  const mutations: Array<[string, string, string]> = [
    ["streamAIResponse", guard, "removedSummaryGuard()"],
    ["streamChatAI", guard, "removedFollowUpGuard()"],
    ["streamAIResponse", "? escapeHtml(err.message", "? String(err.message"],
    ["sendChat", "? escapeHtml(err.message", "? String(err.message"],
  ];
  for (const [name, from, to] of mutations) {
    assert.throws(() => assertRequestIntegration(replaceInFunction(app, name, from, to)), name);
  }
});

test("omits saved API credentials from Local Codex requests", async () => {
  const app = await readSource("app.js");
  assert.equal(count(app, "headers: openAICompatHeaders(apiKey)"), 2);
  assert.equal(count(app, "const requestApiKey = isCodexRequest ? '' : aiSettings.apiKey;"), 2);
  assert.equal(count(app, "'Authorization': 'Bearer ' + apiKey"), 0);
});

test("preserves provider settings and escapes rendered Local Codex errors", async () => {
  const app = await readSource("app.js");
  assert.ok(count(app, "if (engine !== 'codex')") >= 1);
  assert.ok(count(app, "const cm = aiSettings.engine === 'codex' ? '' : (aiSettings.customModel || '').trim();") >= 1);
  assert.ok(count(app, "escapeHtml(err.message") >= 2);
  assert.ok(count(app, "throw error;") >= 1);
  assert.ok(count(app, "return new Error(`${response.status}: ${await response.text()}`)") >= 1);
});
