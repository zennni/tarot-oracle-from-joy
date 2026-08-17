import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import test from "node:test";

test("local UI helper allows only the fixed loopback page", async () => {
  delete (globalThis as { LocalCodexUI?: unknown }).LocalCodexUI;
  await import(`${pathToFileURL(resolve("local-codex-ui.js")).href}?test=${Date.now()}`);
  const api = (globalThis as typeof globalThis & { LocalCodexUI: {
    isLocalPage(location: { protocol: string; hostname: string; port: string }): boolean;
    chatUrl(location: { protocol: string; hostname: string; port: string }): string;
    healthUrl(location: { protocol: string; hostname: string; port: string }): string;
    errorText(code: string, language: "zh" | "en"): string;
  } }).LocalCodexUI;
  const local = { protocol: "http:", hostname: "127.0.0.1", port: "43127" };
  assert.equal(api.isLocalPage(local), true);
  assert.equal(api.chatUrl(local), "/v1/chat/completions");
  assert.equal(api.healthUrl(local), "/health");
  for (const remote of [
    { protocol: "https:", hostname: "example.github.io", port: "" },
    { protocol: "http:", hostname: "localhost", port: "43127" },
    { protocol: "http:", hostname: "127.0.0.1", port: "9999" },
  ]) {
    assert.equal(api.isLocalPage(remote), false);
    assert.equal(api.chatUrl(remote), "");
  }
  assert.match(api.errorText("busy", "zh"), /正在处理/);
  assert.match(api.errorText("upstream_timeout", "en"), /timed out/i);
  assert.match(api.errorText("local_page_required", "zh"), /本地启动器/);
});
