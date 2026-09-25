import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const root = path.resolve("apps/pages/out");
const required = [
  "index.html",
  "calculator/index.html",
  "chart/demo/index.html",
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
  "qimen/index.html",
  "qimen/palaces/index.html",
  "about-julia/index.html",
  "reports/index.html",
  "404.html",
];
for (const file of required)
  assert(existsSync(path.join(root, file)), `Missing route: ${file}`);
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
      assert(url.startsWith("/Astrowed/"), `Incorrect base path: ${url}`);
      const relative = decodeURIComponent(url.slice("/Astrowed/".length));
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
console.log(
  `Pages verification passed: ${htmlCount} HTML pages, routes and asset paths are valid.`,
);
