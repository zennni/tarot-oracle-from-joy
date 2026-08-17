import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const CHINESE_DIRECTIVE = "请全程用简体中文回答。";
const ENGLISH_DIRECTIVE = "Respond in English.";

async function buildPromptFor(lang: "en" | "zh", engine: string): Promise<string> {
  const app = (await readFile("app.js", "utf8")).replace(/\r\n?/g, "\n");
  const start = app.indexOf("function buildSummaryPrompt(");
  const end = app.indexOf("\nfunction buildSmartBuiltinSummary(", start);
  assert.notEqual(start, -1);
  assert.notEqual(end, -1);

  const context: Record<string, unknown> = {
    aiSettings: { engine },
    detectTopic: () => "general",
    drawnEntries: [{
      card: {
        id: 0,
        name: "The Fool",
        nameCN: "愚者",
        upright: { kw: "beginnings", meaning: "a new path" },
        reversed: { kw: "hesitation", meaning: "a delayed start" },
      },
      position: { en: "Present", cn: "现在" },
      reversed: false,
    }],
    getPersonaSystem: () => "persona",
    getWaiteLore: () => "",
    lang,
    window: { __deckStyle: "waite" },
  };
  context.t = (en: string, cn: string) => context.lang === "zh" ? cn : en;

  vm.createContext(context);
  vm.runInContext(
    `${app.slice(start, end)}\nglobalThis.__buildSummaryPrompt = buildSummaryPrompt;`,
    context,
  );
  return (context.__buildSummaryPrompt as (question: string, spread: { name: string }) => string)(
    "我接下来一周最需要关注什么？",
    { name: "Three Card" },
  );
}

test("Local Codex keeps the summary prompt in Chinese under an English UI", async () => {
  const prompt = await buildPromptFor("en", "codex");

  assert.ok(prompt.includes(CHINESE_DIRECTIVE));
  assert.ok(!prompt.includes(ENGLISH_DIRECTIVE));
});

test("non-Codex providers still follow the English UI language", async () => {
  const prompt = await buildPromptFor("en", "openai");

  assert.ok(prompt.includes(ENGLISH_DIRECTIVE));
  assert.ok(!prompt.includes(CHINESE_DIRECTIVE));
});
