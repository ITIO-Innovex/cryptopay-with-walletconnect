#!/usr/bin/env node
/**
 * After `vite build` with CRYPTOPE_SPA_BUILD=1 (TanStack SPA, nitro:false, Docker/nginx),
 * ensure dist/client/index.html exists for nginx try_files. Shell usually lands as
 * dist/client/_shell.html.
 *
 * Skipped for every other build: on Lovable hosting a static dist/client/index.html
 * would be served for "/" INSTEAD of the server-rendered page and the site would
 * render blank.
 */
import fs from "node:fs";
import path from "node:path";

if (process.env.CRYPTOPE_SPA_BUILD !== "1") {
  console.log("[ensure-spa-index] skipped (not a CRYPTOPE_SPA_BUILD=1 static build)");
  process.exit(0);
}

const clientDir = path.resolve(process.cwd(), "dist/client");

function fail(msg) {
  console.error(`[ensure-spa-index] ${msg}`);
  process.exit(1);
}

if (!fs.existsSync(clientDir)) {
  fail(`missing ${clientDir} — build did not emit client assets`);
}

const indexPath = path.join(clientDir, "index.html");
if (fs.existsSync(indexPath) && fs.statSync(indexPath).size > 0) {
  console.log("[ensure-spa-index] index.html already present");
  process.exit(0);
}

for (const candidate of ["_shell.html", "shell.html"]) {
  const p = path.join(clientDir, candidate);
  if (fs.existsSync(p) && fs.statSync(p).size > 0) {
    fs.copyFileSync(p, indexPath);
    console.log(`[ensure-spa-index] copied ${candidate} → index.html`);
    process.exit(0);
  }
}

const assetsDir = path.join(clientDir, "assets");
if (!fs.existsSync(assetsDir)) {
  fail(`missing ${assetsDir} and no SPA shell HTML`);
}

const files = fs.readdirSync(assetsDir);
const jsEntry =
  files.find((f) => /^index-.*\.js$/.test(f)) ||
  files.find((f) => f.endsWith(".js"));
const cssEntry =
  files.find((f) => /^styles-.*\.css$/.test(f)) ||
  files.find((f) => f.endsWith(".css"));

if (!jsEntry) {
  fail(`no client JS entry in ${assetsDir}`);
}

const base = (process.env.VITE_BASE_PATH || process.env.CRYPTOPE_PUBLIC_BASE || "/")
  .trim()
  .replace(/\/?$/, "/");
const assetBase = `${base}assets/`;

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Crypto Checkout</title>
    ${cssEntry ? `<link rel="stylesheet" crossorigin href="${assetBase}${cssEntry}" />` : ""}
    <script type="module" crossorigin src="${assetBase}${jsEntry}"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`;

fs.writeFileSync(indexPath, html);
console.log(`[ensure-spa-index] wrote fallback index.html → ${jsEntry}`);
