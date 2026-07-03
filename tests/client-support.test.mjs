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
    "    globalThis.__supportTest = { ensureToken: ensureToken };\n    var _nonce = null, _noncePromise = null;",
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
  return context.__supportTest;
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
