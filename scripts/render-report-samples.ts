import { chromium } from "playwright";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { calculate, demoInput } from "../src/domain/bazi/engine";
import { reportHtml, type ReportLevel } from "../src/services/report-template";
// Offline document rendering only. Application UI is verified through the
// browser tool; this script renders self-contained report HTML to PDF.
const output = "artifacts/expansion-pdf";
await mkdir(output, { recursive: true });
const cover = `data:image/webp;base64,${(await readFile("src/assets/generated/observatory.webp")).toString("base64")}`;
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
      date: "2026-09-25",
      cover,
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
} finally {
  await browser.close();
}
