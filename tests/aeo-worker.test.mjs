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
  assert.match(html, /https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-CCPCH1LGFY/);
  assert.match(html, /gtag\('config', 'G-CCPCH1LGFY'\);/);

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
  assert.match(html, /The question is bigger:<\/span><br class="mobile-line-break"> <span class="answer-highlight arc-question"><em>does Canada know how to keep builders\?<\/em><\/span>/);
  assert.match(html, /href="https:\/\/joespeaking\.com" target="_blank" rel="noopener">a product<\/a>/);
  assert.match(html, /href="https:\/\/justjoetech\.ca" target="_blank" rel="noopener">a company<\/a>/);
  assert.match(html, /<a class="person-link" href="https:\/\/www\.ontario\.ca\/page\/2026-ontario-immigrant-nominee-program-updates" target="_blank" rel="noopener">Ontario redesigned the Ontario Immigrant Nominee Program \(OINP\)<\/a>/);
  assert.doesNotMatch(html, /<span class="arc-source">/);
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

  assert.match(html, /This is a 2-minute story about how Canada helped <a class="person-link" href="https:\/\/hubeiqiao\.com\/" target="_blank" rel="noopener">Joe<\/a> <span class="answer-highlight">become a builder<\/span>/);
  assert.match(html, /why people already building here need <span class="answer-highlight">fair ways to be recognized<\/span>/);
  assert.doesNotMatch(html, /Canada helped me/);
  assert.doesNotMatch(html, /how Canada helped me/);
});

test("answer copy uses highlights, full program name, and Joe profile links", async () => {
  const html = await fs.readFile(path.join(root, "public", "index.html"), "utf8");

  assert.match(html, /Canada helped <a class="person-link" href="https:\/\/hubeiqiao\.com\/" target="_blank" rel="noopener">Joe<\/a> become a builder\. Here, he studied, built, registered a company, and found community\. Then the pathway changed\. Can Canada recognize builders in time\?/);
  assert.match(html, /<span class="answer-highlight">studied, built his first product, registered a company, and found community<\/span>/);
  assert.match(html, /<span class="answer-highlight"><a class="person-link" href="https:\/\/hubeiqiao\.com\/" target="_blank" rel="noopener">Joe<\/a> became one story in a broader question<\/span>/);
  assert.match(html, /early-stage contributors it helped train/);
  assert.match(html, /Ontario redesigned the Ontario Immigrant Nominee Program \(OINP\)/);
  assert.doesNotMatch(html, /Ontario redesigned OINP/);
  assert.match(html, /<a class="person-link" href="https:\/\/hubeiqiao\.com\/" target="_blank" rel="noopener">Joe<\/a>/);
  assert.match(html, /<a class="person-link" href="https:\/\/hubeiqiao\.com\/" target="_blank" rel="noopener">Joe Hu<\/a>/);
});

test("resources are three exhibits plus two official record rows", async () => {
  const html = await fs.readFile(path.join(root, "public", "index.html"), "utf8");
  const resources = html.match(/<section class="resources"[\s\S]*?<\/section>/)?.[0] || "";

  assert.match(resources, /<div class="resources-title-line">/);
  assert.match(resources, /<h2>Proof behind the story<\/h2>/);
  assert.match(resources, /What <a class="person-link" href="https:\/\/hubeiqiao\.com\/" target="_blank" rel="noopener">Joe<\/a> built, who&rsquo;s vouched for it/);
  assert.match(resources, /Hand-picked for Y Combinator&rsquo;s Startup School 2026/);
  assert.match(resources, /selected from a highly competitive founder pool/);
  assert.match(resources, /The longer essay: leaving an old work rhythm, rebuilding confidence in Canada, and turning that space into Joe Speaking\./);

  const exhibits = [...resources.matchAll(/<span class="res-title res-title-link">([^<]+)<svg class="res-arrow res-title-arrow"/g)].map((match) => match[1]);
  assert.deepEqual(exhibits, ["Joe Speaking", "YC Startup School 2026", "Joe&rsquo;s Canada journey"]);
  assert.doesNotMatch(resources, /<span class="res-link">joespeaking\.com/);
  assert.doesNotMatch(resources, /<span class="res-link">events\.ycombinator\.com/);
  assert.doesNotMatch(resources, /<span class="res-link">hubeiqiao\.com/);

  const recordList = resources.match(/<ol class="record-list[\s\S]*?<\/ol>/)?.[0] || "";
  const records = [...recordList.matchAll(/<span class="record-title">([^<]+)<\/span>/g)].map((match) => match[1]);
  assert.deepEqual(records, ["OINP redesign", "Start-Up Visa status"]);

  assert.match(resources, /1,200\+/);
  assert.match(resources, /30\+/);
  assert.match(resources, /hubeiqiao\.com\/blog\/38b0df12-ec77-80dd-8670-fecc77f7b51b/);
  assert.doesNotMatch(html, /notion\.so/);
});

test("resources include external story between proof cards and official records", async () => {
  const html = await fs.readFile(path.join(root, "public", "index.html"), "utf8");
  const resources = html.match(/<section class="resources"[\s\S]*?<\/section>/)?.[0] || "";

  const proofCardIndex = resources.indexOf("Joe Speaking");
  const externalStoryIndex = resources.indexOf("Built the examiner he needed");
  const officialRecordIndex = resources.indexOf("OINP redesign");

  assert.ok(proofCardIndex >= 0, "proof cards should be present before the external story");
  assert.ok(externalStoryIndex > proofCardIndex, "external story should appear after proof cards");
  assert.ok(officialRecordIndex > externalStoryIndex, "official records should appear after the external story");
  assert.match(resources, /External story/);
  assert.match(resources, /A third-party story on how he turned his English-speaking struggle into Joe Speaking\./);
  assert.match(resources, /https:\/\/byvi\.co\/2026\/07\/02\/joe-hu-built-his-own-ielts-examiner\//);
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
  assert.strictEqual(faq.mainEntity.length, 5, "visible FAQ stays at 5 questions, including submitted-application context");
  assert.ok(
    faq.mainEntity.some((entry) => entry.name === "What about people who already submitted applications?"),
    "FAQPage should include the submitted-application context",
  );
  assert.doesNotMatch(html, /Is Joe asking for a job\?/);

  // the "what this is not" clarification lives ONLY on non-visible surfaces, and both twins carry it
  for (const surface of [llms, workerSrc]) {
    assert.match(surface, /This is not a petition, not a fundraiser, and not immigration advice\./);
    assert.match(surface, /will issue no more invitations/);
    assert.match(surface, /write their Ontario MPP/);
    assert.match(surface, /the people caught in that gap/);
  }
});

test("ask section highlights the core policy argument", async () => {
  const html = await fs.readFile(path.join(root, "public", "index.html"), "utf8");
  const asks = html.match(/<section class="asks"[\s\S]*?<\/section>/)?.[0] || "";

  assert.match(asks, /<span class="signal-context">Job offers and language scores matter\. So do the products, companies, and research people build first\.<\/span>/);
  assert.doesNotMatch(asks, /class="ask-highlight"/);
  assert.match(asks, /<strong class="ask-line-highlight">fair policy should protect the people caught in that gap\.<\/strong>/);
});

test("mobile CSS prevents horizontal overflow without locking root touch scroll", async () => {
  const css = await fs.readFile(path.join(root, "public", "styles.css"), "utf8");
  const mobile = css.match(/@media \(max-width: 760px\) \{([\s\S]*?)\n\}\n\n@media \(max-width: 400px\)/)?.[1] || "";
  const htmlRule = css.match(/html \{([\s\S]*?)\n\}/)?.[1] || "";
  const bodyRule = css.match(/body \{([\s\S]*?)\n\}/)?.[1] || "";

  assert.doesNotMatch(htmlRule, /overflow-x:\s*(hidden|clip)/);
  assert.doesNotMatch(mobile, /html,\n\s*body \{[\s\S]*overflow-x:\s*(hidden|clip)/);
  assert.match(bodyRule, /width: 100%;[\s\S]*max-width: 100%;[\s\S]*overflow-x: hidden;/);
  assert.match(mobile, /body \{[\s\S]*overflow-x: hidden;[\s\S]*overscroll-behavior-x: none;/);
  assert.match(mobile, /\.hero-eyebrow \{[\s\S]*white-space: normal;[\s\S]*overflow-wrap: anywhere;/);
  assert.match(mobile, /\.hero-actions \{ max-width: 100%; min-width: 0;/);
  assert.match(mobile, /\.film-title \{[\s\S]*white-space: normal;[\s\S]*overflow-wrap: break-word;/);
  assert.match(mobile, /\.film-stage \{ width: 100%; max-width: 100%;/);
  assert.match(mobile, /\.arc-question \{[\s\S]*white-space: normal;[\s\S]*overflow-wrap: break-word;/);
  assert.match(mobile, /\.footer-copy-open \{[\s\S]*white-space: normal;/);
});

test("story video uses a mobile source and hook frame while loading", async () => {
  const html = await fs.readFile(path.join(root, "public", "index.html"), "utf8");
  const script = await fs.readFile(path.join(root, "public", "script.js"), "utf8");
  const css = await fs.readFile(path.join(root, "public", "styles.css"), "utf8");

  assert.match(html, /data-full-src="media\/oinp-feedback-story-full\.mp4"/);
  assert.match(html, /data-mobile-src="media\/oinp-feedback-story-mobile-720p\.mp4"/);
  assert.match(html, /data-loading-poster="media\/hero-hook-poster\.jpg"/);
  assert.match(script, /function selectStorySrc\(\)/);
  assert.match(script, /matchMedia\("\(max-width: 760px\)"/);
  assert.match(script, /stage\.classList\.add\("loading"\)/);
  assert.match(script, /stage\.classList\.remove\("loading"\)/);
  assert.match(css, /\.film-stage\.loading::before \{[\s\S]*hero-hook-poster\.jpg/);
  await fs.stat(path.join(root, "public", "media", "oinp-feedback-story-mobile-720p.mp4"));
});
