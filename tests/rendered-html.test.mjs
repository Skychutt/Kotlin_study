import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("https://course.example/", {
      headers: { accept: "text/html", host: "course.example" },
    }),
    {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server renders the Kotlin course shell and social metadata", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Kotlin 全语法与 Android 独立开发完整教程/);
  assert.match(html, /Kotlin全语法教学\.html/);
  assert.match(html, /https:\/\/course\.example\/og\.png/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/);
});

test("standalone course contains all chapters and offline interactions", async () => {
  const files = await readdir(root);
  const htmlName = files.find((name) => name.endsWith(".html"));
  assert.ok(htmlName);

  const [html, publicHtml] = await Promise.all([
    readFile(new URL(htmlName, root), "utf8"),
    readFile(new URL(`public/${htmlName}`, root), "utf8"),
  ]);

  assert.equal(html, publicHtml);
  assert.equal((html.match(/data-progress="chapter-/g) ?? []).length, 50);
  assert.ok((html.match(/class="code-wrap"/g) ?? []).length >= 70);
  assert.match(html, /50 章完整路径/);
  assert.match(html, /id="search"/);
  assert.match(html, /id="quiz"/);
  assert.match(html, /kotlin-course-progress-v1/);
  assert.doesNotMatch(html, /<script[^>]+src=|<link[^>]+href=/);
});
