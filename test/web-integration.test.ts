import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

function count(source: string, marker: string): number {
  return [...source.matchAll(new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"))].length;
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
    "aiSettings.engine === 'codex'",
    "LocalCodexUI.errorText('local_page_required', lang)",
  ]) assert.ok(count(app, marker) >= 1, marker);
}

test("contains every Local Codex integration marker exactly where required", async () => {
  const index = await readFile("index.html", "utf8");
  const app = await readFile("app.js", "utf8");
  assertIntegration(index, app);
});

test("fails when any non-first required marker is removed", async () => {
  const index = await readFile("index.html", "utf8");
  const app = await readFile("app.js", "utf8");
  const mutations: Array<[string, string, "index" | "app"]> = [
    ['id="local-codex-status"', 'id="removed-status"', "index"],
    ['<script src="local-codex-ui.js"></script>', '<script src="removed.js"></script>', "index"],
    ["LocalCodexUI.chatUrl(window.location)", "removedChatUrl()", "app"],
    ["LocalCodexUI.errorText('local_page_required', lang)", "removedErrorText()", "app"],
  ];
  for (const [from, to, target] of mutations) {
    assert.throws(() => assertIntegration(
      target === "index" ? index.replace(from, to) : index,
      target === "app" ? app.replaceAll(from, to) : app,
    ));
  }
});

test("omits saved API credentials from Local Codex requests", async () => {
  const app = await readFile("app.js", "utf8");
  assert.equal(count(app, "headers: openAICompatHeaders(apiKey)"), 2);
  assert.equal(count(app, "const requestApiKey = aiSettings.engine === 'codex' ? '' : aiSettings.apiKey;"), 2);
  assert.equal(count(app, "'Authorization': 'Bearer ' + apiKey"), 0);
});

test("preserves provider settings and escapes rendered Local Codex errors", async () => {
  const app = await readFile("app.js", "utf8");
  assert.ok(count(app, "if (engine !== 'codex')") >= 1);
  assert.ok(count(app, "const cm = aiSettings.engine === 'codex' ? '' : (aiSettings.customModel || '').trim();") >= 1);
  assert.ok(count(app, "escapeHtml(err.message") >= 2);
  assert.ok(count(app, "throw error;") >= 1);
  assert.ok(count(app, "return new Error(`${response.status}: ${await response.text()}`)") >= 1);
});
