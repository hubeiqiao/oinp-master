import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");

async function loadWorker() {
  const source = await fs.readFile(path.join(root, "worker.js"), "utf8");
  const transformed = source.replace("export default {", "globalThis.workerDefault = {");
  const context = vm.createContext({
    console,
    crypto: globalThis.crypto,
    Headers,
    Request,
    Response,
    TextDecoder,
    TextEncoder,
    URL,
    URLSearchParams,
    setTimeout,
    clearTimeout,
  });
  vm.runInContext(transformed, context, { filename: "worker.js" });
  return context.workerDefault;
}

function assetEnv() {
  return {
    ASSETS: {
      fetch(request) {
        const url = new URL(request.url);
        if (url.pathname === "/llms.txt") {
          return new Response("# OINP Builder Story\n", {
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          });
        }
        return new Response("<!doctype html><title>OINP</title>", {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      },
    },
  };
}

test("homepage advertises agent discovery resources with Link headers", async () => {
  const worker = await loadWorker();
  const response = await worker.fetch(new Request("https://oinp.hubeiqiao.com/"), assetEnv(), {});
  const link = response.headers.get("Link") || "";

  assert.match(link, /rel="api-catalog"/);
  assert.match(link, /\/\.well-known\/api-catalog/);
  assert.match(link, /rel="alternate"/);
  assert.match(link, /\/llms\.txt/);
  assert.equal(response.headers.get("Content-Signal"), "ai-train=no, search=yes, ai-input=yes");
});

test("homepage returns markdown when an agent requests text/markdown", async () => {
  const worker = await loadWorker();
  const response = await worker.fetch(
    new Request("https://oinp.hubeiqiao.com/", { headers: { Accept: "text/markdown" } }),
    assetEnv(),
    {},
  );

  assert.match(response.headers.get("Content-Type") || "", /text\/markdown/);
  assert.equal(response.headers.get("Vary"), "Accept");
  assert.match(await response.text(), /Canada helped Joe become a builder/);
});

test("api catalog is discoverable as a linkset", async () => {
  const worker = await loadWorker();
  const response = await worker.fetch(new Request("https://oinp.hubeiqiao.com/.well-known/api-catalog"), assetEnv(), {});
  const body = await response.json();

  assert.equal(response.headers.get("Content-Type"), "application/linkset+json; charset=utf-8");
  assert.ok(Array.isArray(body.linkset));
  assert.match(JSON.stringify(body), /service-desc/);
  assert.match(JSON.stringify(body), /service-doc/);
});

test("public discovery files exist", async () => {
  const robots = await fs.readFile(path.join(root, "public", "robots.txt"), "utf8");
  const sitemap = await fs.readFile(path.join(root, "public", "sitemap.xml"), "utf8");
  const llms = await fs.readFile(path.join(root, "public", "llms.txt"), "utf8");
  const openapi = await fs.readFile(path.join(root, "public", "openapi.json"), "utf8");

  assert.match(robots, /Content-Signal: ai-train=no, search=yes, ai-input=yes/);
  assert.match(robots, /Sitemap: https:\/\/oinp\.hubeiqiao\.com\/sitemap\.xml/);
  assert.match(sitemap, /https:\/\/oinp\.hubeiqiao\.com\/archive\/proposal-25-mlitsd019\//);
  assert.match(llms, /Does Canada know how to keep builders\?/);
  assert.doesNotThrow(() => JSON.parse(openapi));
});

test("homepage metadata is aligned for search and answer engines", async () => {
  const html = await fs.readFile(path.join(root, "public", "index.html"), "utf8");

  assert.match(html, /<title>Canada helped me become a builder\. Does Canada know how to keep builders\?<\/title>/);
  assert.match(html, /property="og:title" content="Canada helped Joe become a builder\. Does Canada know how to keep builders\?"/);
  assert.match(html, /name="twitter:title" content="Canada helped Joe become a builder\. Does Canada know how to keep builders\?"/);

  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert.equal(blocks.length, 1);
  const data = JSON.parse(blocks[0][1]);
  const graph = data["@graph"] || [data];
  const page = graph.find((node) => node["@type"] === "WebPage");
  const faq = graph.find((node) => node["@type"] === "FAQPage");

  assert.ok(page, "WebPage JSON-LD node should exist");
  assert.equal(page.url, "https://oinp.hubeiqiao.com/");
  assert.equal(page.author.name, "Joe Hu");
  assert.equal(page.video["@type"], "VideoObject");
  assert.equal(page.video.contentUrl, "https://oinp.hubeiqiao.com/media/oinp-feedback-story.mp4");

  assert.ok(faq, "FAQPage JSON-LD node should exist");
  assert.ok(faq.mainEntity.some((entry) => entry.name === "What is this page about?"));
  assert.match(JSON.stringify(faq), /What is Joe asking for\?/);
});

test("visitor share copy uses third-person aligned messaging", async () => {
  const script = await fs.readFile(path.join(root, "public", "script.js"), "utf8");

  assert.match(script, /Canada helped Joe become a builder\. Does Canada know how to keep builders\?/);
  assert.match(script, /He studied, built, registered a company, and found community here\./);
  assert.doesNotMatch(script, /Can Canada keep builders here\?/);
  assert.doesNotMatch(script, /before it loses them/);
});

test("homepage exposes visible answer sections for search and answer engines", async () => {
  const html = await fs.readFile(path.join(root, "public", "index.html"), "utf8");

  assert.match(html, /id="answer-brief"/);
  assert.match(html, /What this page is about/);
  assert.match(html, /What changed/);
  assert.match(html, /What Joe is asking for/);
  assert.match(html, /id="story-summary"/);
  assert.match(html, /Read the story summary/);
  assert.match(html, /Evidence and resources/);
  assert.match(html, /These proof points connect Joe's personal story to the policy question/);
  assert.match(html, /id="faq"/);
  assert.match(html, /What is this page about\?/);
  assert.match(html, /How can people help\?/);
});
