import { chromium } from "playwright";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { calculate, demoInput } from "../src/domain/bazi/engine";
import { reportHtml, type ReportLevel } from "../src/services/report-template";
import { reportArtworkFiles } from "../src/services/report-artwork-files";
import { qimenPrintSvg } from "../src/services/qimen-print";
import { calculateQimen } from "../src/domain/qimen/engine";
// Offline document rendering only. Application UI is verified through the
// browser tool; this script renders self-contained report HTML to PDF.
const output = "output/pdf";
await mkdir(output, { recursive: true });
const artwork = Object.fromEntries(
  await Promise.all(
    Object.entries(reportArtworkFiles).map(async ([key, file]) => [
      key,
      `data:image/webp;base64,${(await readFile(`src/assets/generated/${file}`)).toString("base64")}`,
    ]),
  ),
);
const browser = await chromium.launch({
  headless: true,
  channel: process.platform === "win32" ? "msedge" : undefined,
});
try {
  const page = await browser.newPage();
  await page.route("**/*", (route) => route.abort());
  for (const level of ["brief", "full", "professional"] as ReportLevel[]) {
    const html = reportHtml(calculate(demoInput), {
      level,
      date: "2026-09-26",
      artwork,
    });
    await writeFile(`${output}/${level}.html`, html);
    await page.setContent(html, { waitUntil: "load" });
    await page.pdf({
      path: `${output}/${level}.pdf`,
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: true,
      headerTemplate: "<span></span>",
      footerTemplate:
        '<div style="width:100%;text-align:center;font:8px Arial;color:#647767">ASTROWED · <span class="pageNumber"></span> / <span class="totalPages"></span></div>',
    });
    console.log(`${level}: PDF rendered`);
  }
  const svg = qimenPrintSvg(calculateQimen(demoInput), artwork);
  await writeFile(`${output}/qimen.svg`, svg);
  await page.setContent(
    `<html><head><style>@page{size:A4;margin:0}body{margin:0}svg{display:block;width:210mm;height:297mm}</style></head><body>${svg}</body></html>`,
    { waitUntil: "load" },
  );
  await page.pdf({
    path: `${output}/qimen.pdf`,
    printBackground: true,
    preferCSSPageSize: true,
  });
  console.log("qimen: PDF rendered");
} finally {
  await browser.close();
}
