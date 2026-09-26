import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const root = path.resolve("apps/pages/out");
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const prefix = `${basePath}/`;
const required = [
  "locations/addresses/astana.json",
  "maplibre/maplibre-gl-worker.mjs",
  "maplibre/maplibre-gl-shared.mjs",
  "index.html",
  "calculator/index.html",
  "chart/demo/index.html",
  "chart/current/index.html",
  "knowledge/solar-time/index.html",
  "knowledge/ten-gods/index.html",
  "explore/index.html",
  "knowledge/index.html",
  "knowledge/graph/index.html",
  "clients/index.html",
  "bazi/index.html",
  "bazi/current-energies/index.html",
  "bazi/life-years/index.html",
  "bazi/stars/index.html",
  "feng-shui/index.html",
  "feng-shui/bagua/index.html",
  "feng-shui/gua/index.html",
  "feng-shui/compass/index.html",
  "compasses/index.html",
  "calendar/index.html",
  "qimen/index.html",
  "qimen/palaces/index.html",
  "about-julia/index.html",
  "reports/index.html",
  "404.html",
];
for (const file of required)
  assert(existsSync(path.join(root, file)), `Missing route: ${file}`);
const catalogue = JSON.parse(
  readFileSync("src/data/city-catalog.json", "utf8"),
);
for (const country of catalogue.countries) {
  const relative = `locations/${country}.json`;
  assert.equal(
    readFileSync(path.join(root, relative), "utf8"),
    readFileSync(path.join("public", relative), "utf8"),
    `Missing or stale city catalogue: ${country}`,
  );
}
assert(!existsSync(path.join(root, "api")), "Server API must not be exported");
let htmlCount = 0;
function inspect(dir: string) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      inspect(file);
      continue;
    }
    if (!file.endsWith(".html")) continue;
    htmlCount++;
    const html = readFileSync(file, "utf8");
    assert(
      !/postgres(?:ql)?:\/\/|WORKSPACE_PASSWORD|SESSION_SECRET/.test(html),
      `Private configuration in ${file}`,
    );
    for (const match of html.matchAll(
      /(?:href|src)="(\/[^"#?]*)(?:[?#][^"]*)?"/g,
    )) {
      const url = match[1];
      assert(url.startsWith(prefix), `Incorrect base path: ${url}`);
      const relative = decodeURIComponent(url.slice(prefix.length));
      const target = path.join(root, relative);
      assert(
        existsSync(
          target.endsWith(path.sep) || !path.extname(target)
            ? path.join(target, "index.html")
            : target,
        ),
        `Broken link: ${url}`,
      );
    }
  }
}
inspect(root);
const articleCovers = new Map<string, string>();
const articleCoverHashes = new Set<string>();
for (const entry of readdirSync(path.join(root, "knowledge"), {
  withFileTypes: true,
})) {
  if (!entry.isDirectory()) continue;
  const file = path.join(root, "knowledge", entry.name, "index.html");
  if (!existsSync(file)) continue;
  const html = readFileSync(file, "utf8");
  const hero = html.match(
    /<figure class="article-hero[^"]*">([\s\S]*?)<\/figure>/,
  )?.[1];
  if (!hero) continue;
  const src = hero.match(/<img\b[^>]*\bsrc="([^"]+)"/)?.[1];
  assert(src, `Missing article cover: ${entry.name}`);
  assert(
    !articleCovers.has(src),
    `Repeated article cover: ${entry.name} and ${articleCovers.get(src)}`,
  );
  articleCovers.set(src, entry.name);
  const asset = path.join(root, decodeURIComponent(src.slice(prefix.length)));
  const hash = createHash("sha256").update(readFileSync(asset)).digest("hex");
  assert(
    !articleCoverHashes.has(hash),
    `Duplicate image contents: ${entry.name}`,
  );
  articleCoverHashes.add(hash);
}
assert.equal(
  articleCovers.size,
  19,
  "Every library article must have a unique generated cover",
);
console.log(
  `Pages verification passed: ${htmlCount} HTML pages, ${articleCovers.size} unique article covers, routes and asset paths are valid.`,
);
