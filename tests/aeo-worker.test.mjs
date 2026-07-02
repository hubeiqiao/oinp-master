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
  assert.match(await response.text(), /Canada helped \[Joe\]\(https:\/\/hubeiqiao\.com\/\) become a builder/);
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

  assert.match(html, /<title>Canada helped Joe become a builder\. Does Canada know how to keep builders\?<\/title>/);
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
  assert.match(JSON.stringify(faq), /What is the ask\?/);
});

test("visitor share copy uses third-person aligned messaging", async () => {
  const script = await fs.readFile(path.join(root, "public", "script.js"), "utf8");

  assert.match(script, /Canada helped Joe become a builder\. Does Canada know how to keep builders\?/);
  assert.match(script, /He studied, built, registered a company, and found community here\./);
  assert.match(script, /can Canada retain early-stage contributors it helped train while their value is still emerging and hard to classify\?/);
  assert.doesNotMatch(script, /Can Canada keep builders here\?/);
  assert.doesNotMatch(script, /before it loses them/);
  assert.doesNotMatch(script, /one job offer/);
  assert.doesNotMatch(script, /startup ecosystem/);
});

test("homepage exposes visible answer sections for search and answer engines", async () => {
  const html = await fs.readFile(path.join(root, "public", "index.html"), "utf8");

  assert.match(html, /id="answer-brief"/);
  assert.match(html, /Personal story\./);
  assert.match(html, /Structural question\./);
  assert.match(html, /The work is visible/);
  assert.doesNotMatch(html, /The proof is real/);
  assert.match(html, /The former graduate streams will issue no more invitations\./);
  assert.match(html, /The question is bigger: <em>does Canada know how to keep builders\?<\/em>/);
  assert.match(html, /id="story-summary"/);
  assert.match(html, /The short version/);
  assert.match(html, /Evidence and resources/);
  assert.match(html, /What <a class="person-link" href="https:\/\/hubeiqiao\.com\/" target="_blank" rel="noopener">Joe<\/a> built, who&rsquo;s vouched for it/);
  assert.match(html, /id="faq"/);
  assert.match(html, /What is this page about\?/);
  assert.match(html, /How can people help\?/);
  assert.doesNotMatch(html, /The old pathways are gone/);
  assert.doesNotMatch(html, /Count builder evidence/);
  assert.doesNotMatch(html, /French ability is one kind of evidence/);
  assert.doesNotMatch(html, /one permanent job/);
  assert.doesNotMatch(html, /one permanent job offer/);
  assert.doesNotMatch(html, /builder activity as evidence/);
  assert.doesNotMatch(html, /startup-era talent/);
  assert.doesNotMatch(html, /startup ecosystem/);
});

test("film copy uses Joe in third person", async () => {
  const html = await fs.readFile(path.join(root, "public", "index.html"), "utf8");

  assert.match(html, /This is a 2-minute story about how Canada helped Joe become a builder/);
  assert.doesNotMatch(html, /Canada helped me/);
  assert.doesNotMatch(html, /how Canada helped me/);
});

test("answer copy uses highlights, full program name, and Joe profile links", async () => {
  const html = await fs.readFile(path.join(root, "public", "index.html"), "utf8");

  assert.match(html, /<span class="answer-highlight">studied, built his first product, registered a company, and found community<\/span>/);
  assert.match(html, /<span class="answer-highlight">Joe became one story in a broader question<\/span>/);
  assert.match(html, /early-stage contributors it helped train/);
  assert.match(html, /Ontario redesigned the Ontario Immigrant Nominee Program \(OINP\)/);
  assert.doesNotMatch(html, /Ontario redesigned OINP/);
  assert.match(html, /<a class="person-link" href="https:\/\/hubeiqiao\.com\/" target="_blank" rel="noopener">Joe<\/a>/);
  assert.match(html, /<a class="person-link" href="https:\/\/hubeiqiao\.com\/" target="_blank" rel="noopener">Joe Hu<\/a>/);
});

test("resources are two exhibits plus three official record rows", async () => {
  const html = await fs.readFile(path.join(root, "public", "index.html"), "utf8");
  const resources = html.match(/<section class="resources"[\s\S]*?<\/section>/)?.[0] || "";

  assert.match(resources, /<div class="resources-title-line">/);
  assert.match(resources, /<h2>Proof behind the story<\/h2>/);
  assert.match(resources, /What <a class="person-link" href="https:\/\/hubeiqiao\.com\/" target="_blank" rel="noopener">Joe<\/a> built, who&rsquo;s vouched for it/);

  const exhibits = [...resources.matchAll(/<span class="res-title">([^<]+)<\/span>/g)].map((match) => match[1]);
  assert.deepEqual(exhibits, ["Joe Speaking", "YC Startup School 2026", "Joe&rsquo;s Canada journey"]);

  const records = [...resources.matchAll(/<span class="record-title">([^<]+)<\/span>/g)].map((match) => match[1]);
  assert.deepEqual(records, ["OINP redesign", "Start-Up Visa status"]);

  assert.match(resources, /1,200\+/);
  assert.match(resources, /30\+/);
  assert.match(resources, /hubeiqiao\.com\/blog\/38b0df12-ec77-80dd-8670-fecc77f7b51b/);
  assert.doesNotMatch(html, /notion\.so/);
});

test("faq details use single-open accordion behavior", async () => {
  const script = await fs.readFile(path.join(root, "public", "script.js"), "utf8");

  assert.match(script, /function initFaqDetails\(\)/);
  assert.match(script, /document\.querySelectorAll\("\.faq-item"\)/);
  assert.match(script, /other\.open = false/);
  assert.match(script, /initFaqDetails\(\);/);
});

test("AEO guards: video uploadDate, FAQ count, and markdown twins stay aligned", async () => {
  const html = await fs.readFile(path.join(root, "public", "index.html"), "utf8");
  const llms = await fs.readFile(path.join(root, "public", "llms.txt"), "utf8");
  const workerSrc = await fs.readFile(path.join(root, "worker.js"), "utf8");

  const block = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  const graph = JSON.parse(block[1])["@graph"];
  const page = graph.find((node) => node["@type"] === "WebPage");
  const faq = graph.find((node) => node["@type"] === "FAQPage");

  assert.match(page.video.uploadDate || "", /^\d{4}-\d{2}-\d{2}$/, "VideoObject needs uploadDate for video rich results");
  assert.strictEqual(faq.mainEntity.length, 4, "visible FAQ stays at 4 questions — no job-search FAQ");
  assert.doesNotMatch(html, /Is Joe asking for a job\?/);

  // the "what this is not" clarification lives ONLY on non-visible surfaces, and both twins carry it
  for (const surface of [llms, workerSrc]) {
    assert.match(surface, /This is not a petition, not a fundraiser, and not immigration advice\./);
    assert.match(surface, /will issue no more invitations/);
    assert.match(surface, /the people caught in that gap/);
  }
});
