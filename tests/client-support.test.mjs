import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");

async function loadSupportHelpers() {
  const source = await fs.readFile(path.join(root, "public", "script.js"), "utf8");
  const instrumented = source.replace(
    "    var _nonce = null, _noncePromise = null;",
    "    globalThis.__supportTest = { ensureToken: ensureToken, initSupport: initSupport };\n    var _nonce = null, _noncePromise = null;",
  );
  const storage = new Map();
  const context = vm.createContext({
    console,
    crypto: {
      randomUUID() {
        return "12345678-1234-4234-9234-123456789abc";
      },
    },
    localStorage: {
      getItem(key) { return storage.has(key) ? storage.get(key) : null; },
      setItem(key, value) { storage.set(key, String(value)); },
    },
    window: {
      crypto: {
        randomUUID() {
          return "12345678-1234-4234-9234-123456789abc";
        },
      },
      matchMedia() {
        return { matches: false, addEventListener() {}, removeEventListener() {} };
      },
    },
    document: {
      addEventListener() {},
      querySelector() { return null; },
      querySelectorAll() { return []; },
      documentElement: { classList: { add() {}, remove() {} } },
    },
    requestAnimationFrame() { return 0; },
    cancelAnimationFrame() {},
    setTimeout,
    clearTimeout,
    URLSearchParams,
  });
  context.window.window = context.window;
  context.window.document = context.document;
  context.window.localStorage = context.localStorage;
  vm.runInContext(instrumented, context, { filename: "public/script.js" });
  return { ...context.__supportTest, context };
}

function classList() {
  const names = new Set();
  return {
    add(name) { names.add(name); },
    remove(name) { names.delete(name); },
    contains(name) { return names.has(name); },
  };
}

test("support token is regenerated when stored browser state is malformed", async () => {
  const { ensureToken } = await loadSupportHelpers();
  const state = {
    token: "bad token with spaces",
    supported: true,
    receipt: "OINP-OLDTOKEN",
    updateToken: "old-update-token",
  };

  const token = ensureToken(state);

  assert.match(token, /^[A-Za-z0-9._-]{8,80}$/);
  assert.notEqual(token, "bad token with spaces");
  assert.equal(state.supported, false);
  assert.equal(state.receipt, "");
  assert.equal(state.updateToken, "");
});

test("support click gives immediate in-flight feedback while saving", async () => {
  const { initSupport, context } = await loadSupportHelpers();
  const label = { textContent: "I support fair pathways" };
  const button = {
    classList: classList(),
    disabled: false,
    attrs: {},
    setAttribute(name, value) { this.attrs[name] = String(value); },
    removeAttribute(name) { delete this.attrs[name]; },
    addEventListener(_event, handler) { this.click = handler; },
  };
  const elements = {
    "[data-support-ask]": { hidden: false },
    "[data-support-thanks]": { hidden: true, style: {} },
    "[data-support-btn]": button,
    "[data-support-error]": { hidden: true, textContent: "" },
    "[data-support-count]": null,
    "[data-support-receipt]": null,
    "[data-signature-num]": null,
    "[data-signature-count]": null,
    ".btn-support-label": label,
  };
  const rootNode = {
    querySelector(selector) {
      return elements[selector] || null;
    },
  };
  context.fetch = () => new Promise(() => {});
  context.document.querySelector = (selector) => selector === "[data-support]" ? rootNode : null;

  initSupport();
  button.click();

  assert.equal(button.classList.contains("is-loading"), true);
  assert.equal(button.disabled, true);
  assert.equal(button.attrs["aria-busy"], "true");
  assert.equal(label.textContent, "Counting your support");
});

test("mobile X and LinkedIn actions prefer app-scheme links with web fallback", async () => {
  const html = await fs.readFile(path.join(root, "public", "index.html"), "utf8");
  const script = await fs.readFile(path.join(root, "public", "script.js"), "utf8");

  assert.match(html, /class="footer-social-x" href="https:\/\/x\.com\/hubeiqiao" data-app-href="twitter:\/\/user\?screen_name=hubeiqiao" data-web-href="https:\/\/x\.com\/hubeiqiao"/);
  assert.match(html, /class="footer-social-linkedin" href="https:\/\/linkedin\.com\/in\/hubeiqiao" data-app-href="linkedin:\/\/in\/hubeiqiao" data-web-href="https:\/\/linkedin\.com\/in\/hubeiqiao"/);

  assert.match(script, /function initAppSchemeLinks\(\)/);
  assert.match(script, /twitter:\/\/post\?message=/);
  assert.match(script, /linkedin:\/\/shareArticle\?mini=true/);
});

test("mobile footer avoids inherited viewport height and axis-mixed overflow", async () => {
  const styles = await fs.readFile(path.join(root, "public", "styles.css"), "utf8");
  const mobileFooter = styles.match(/\.story-footer\s*{\s*\n\s*min-height: auto !important;[\s\S]*?\n    }/);

  assert.ok(mobileFooter, "expected to find the mobile story-footer override");
  assert.match(mobileFooter[0], /overflow:\s*hidden;/);
  assert.doesNotMatch(mobileFooter[0], /overflow-x:\s*clip;/);
});

test("mobile footer has a runtime tail guard for real iOS WebView layout drift", async () => {
  const html = await fs.readFile(path.join(root, "public", "index.html"), "utf8");
  const script = await fs.readFile(path.join(root, "public", "script.js"), "utf8");
  const styles = await fs.readFile(path.join(root, "public", "styles.css"), "utf8");

  assert.match(html, /styles\.css\?v=107/);
  assert.match(html, /script\.js\?v=48/);
  assert.match(script, /function initFooterTailGuard\(\)/);
  assert.match(script, /footer-tail-trimmed/);
  assert.match(script, /__oinpFooterProbe/);
  assert.match(script, /initFooterTailGuard\(\)/);
  assert.match(styles, /\.story-footer\.footer-tail-trimmed/);
  assert.match(styles, /height:\s*var\(--footer-trim-height\)/);
});

test("footer probe diagnostics stay invisible in production", async () => {
  const html = await fs.readFile(path.join(root, "public", "index.html"), "utf8");
  const script = await fs.readFile(path.join(root, "public", "script.js"), "utf8");
  const styles = await fs.readFile(path.join(root, "public", "styles.css"), "utf8");

  assert.match(html, /styles\.css\?v=107/);
  assert.match(html, /script\.js\?v=48/);
  assert.match(script, /window\.__oinpFooterProbe/);
  assert.match(script, /tailChildren/);
  assert.match(script, /bodyHeight/);
  assert.doesNotMatch(script, /function renderFooterProbeOverlay/);
  assert.doesNotMatch(script, /function renderFooterProbePanel/);
  assert.doesNotMatch(script, /footerProbe=1/);
  assert.doesNotMatch(script, /window\.__oinpFooterProbeLast/);
  assert.doesNotMatch(script, /\[OINP footer probe\]/);
  assert.doesNotMatch(styles, /\.footer-probe-overlay/);
  assert.doesNotMatch(styles, /\.footer-probe-panel/);
});

test("mobile footer trim is based on real content tail, not viewport spacer height", async () => {
  const html = await fs.readFile(path.join(root, "public", "index.html"), "utf8");
  const script = await fs.readFile(path.join(root, "public", "script.js"), "utf8");
  const styles = await fs.readFile(path.join(root, "public", "styles.css"), "utf8");

  assert.match(html, /styles\.css\?v=107/);
  assert.match(html, /script\.js\?v=48/);
  assert.match(script, /function getFooterContentBottom/);
  assert.match(script, /contentTailGap/);
  assert.match(script, /contentDrivenHeight/);
  assert.match(styles, /\.story-footer\s*\{[\s\S]*?min-height:\s*auto !important;/);
  assert.match(styles, /\.story-footer\s*\{[\s\S]*?overflow:\s*hidden;/);
  assert.match(styles, /\.footer-canvas\s*\{[\s\S]*?grid-template-rows:\s*none;/);
});
