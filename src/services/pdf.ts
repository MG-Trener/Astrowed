import "server-only";
import { chromium } from "playwright";
import type { Chart } from "@/domain/bazi/types";
import { reportHtml } from "./report-template";
import type { ReportOptions } from "./report-template";
import { readFile } from "node:fs/promises";
import path from "node:path";
export async function generatePdf(chart: Chart, options: ReportOptions = {}) {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  const browser = await chromium.launch({
    headless: true,
    executablePath,
    channel:
      !executablePath && process.platform === "win32" ? "msedge" : undefined,
  });
  try {
    const page = await browser.newPage();
    await page.route("**/*", (route) => route.abort());
    const cover = await readFile(
      path.join(process.cwd(), "src/assets/generated/observatory.webp"),
    );
    await page.setContent(
      reportHtml(chart, {
        ...options,
        cover: `data:image/webp;base64,${cover.toString("base64")}`,
      }),
      { waitUntil: "load" },
    );
    return await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: true,
      headerTemplate: "<span></span>",
      footerTemplate:
        '<div style="width:100%;text-align:center;font:8px Arial;color:#647767">ASTROWED · <span class="pageNumber"></span> / <span class="totalPages"></span></div>',
    });
  } finally {
    await browser.close();
  }
}
