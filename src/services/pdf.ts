import "server-only";
import { chromium } from "playwright";
import type { Chart } from "@/domain/bazi/types";
import { reportHtml } from "./report-template";
export async function generatePdf(chart: Chart) {
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
    await page.setContent(reportHtml(chart), { waitUntil: "load" });
    return await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });
  } finally {
    await browser.close();
  }
}
