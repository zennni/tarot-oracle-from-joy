import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

type Manifest = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

function assertStartupContract(manifest: Manifest, batch: string): void {
  assert.equal(manifest.dependencies?.tsx, "4.23.12");
  assert.equal(manifest.devDependencies?.tsx, undefined);
  assert.match(batch, /where npm >nul 2>nul/);
  assert.match(batch, /:validate_dependencies/);
  assert.match(batch, /node_modules\\\.bin\\tsx\.cmd/);
  assert.match(batch, /node_modules\\@openai\\codex-sdk\\dist\\index\.js/);
  assert.match(batch, /typeof m\.Codex === 'function'/);
  assert.match(batch, /node_modules\\@openai\\codex\\bin\\codex\.js/);
  assert.match(batch, /codex-win32-/);
  assert.match(batch, /codex\.js" --version/);
  assert.match(batch, /call npm ci/);
  assert.match(batch, /set "local_exit=%errorlevel%"/);
  assert.ok(batch.indexOf('set "local_exit=%errorlevel%"') < batch.lastIndexOf("pause"));
  assert.match(batch, /exit \/b %local_exit%/);
}

test("one-click startup repairs every missing runtime artifact and preserves local exit status", async () => {
  const manifest = JSON.parse(await readFile("package.json", "utf8")) as Manifest;
  const batch = await readFile("start-local-codex.cmd", "utf8");
  assertStartupContract(manifest, batch);
});

test("startup contract detects an independently removed runtime prerequisite", async () => {
  const manifest = JSON.parse(await readFile("package.json", "utf8")) as Manifest;
  const batch = await readFile("start-local-codex.cmd", "utf8");
  const mutations = [
    batch.replace("where npm >nul 2>nul", "rem removed npm check"),
    batch.replace("node_modules\\.bin\\tsx.cmd", "node_modules\\.bin\\missing.cmd"),
    batch.replace("typeof m.Codex === 'function'", "false"),
    batch.replaceAll("node_modules\\@openai\\codex\\bin\\codex.js", "missing-codex.js"),
    batch.replace('set "local_exit=%errorlevel%"', 'set "local_exit=0"'),
  ];
  for (const mutated of mutations) {
    assert.throws(() => assertStartupContract(manifest, mutated));
  }
});
