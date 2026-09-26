import "dotenv/config";
import { SignJWT } from "jose";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
import pg from "pg";
import { demoInput } from "../src/domain/bazi/engine";
const base = "http://127.0.0.1:3000";
const token = await new SignJWT({ role: "consultant" })
  .setProtectedHeader({ alg: "HS256" })
  .setIssuer("astrowed")
  .setAudience("consultant")
  .setIssuedAt()
  .setExpirationTime("5m")
  .sign(new TextEncoder().encode(process.env.SESSION_SECRET));
const headers = {
  "Content-Type": "application/json",
  Origin: base,
  Cookie: `astrowed-session=${token}`,
};
const unauthorized = await fetch(`${base}/api/charts`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(demoInput),
});
assert.equal(unauthorized.status, 401);
const csrf = await fetch(`${base}/api/charts`, {
  method: "POST",
  headers: { ...headers, Origin: "https://example.invalid" },
  body: JSON.stringify(demoInput),
});
assert.equal(csrf.status, 400);
const invalid = await fetch(`${base}/api/calculate`, {
  method: "POST",
  headers,
  body: JSON.stringify({ ...demoInput, date: "2023-02-29" }),
});
assert.equal(invalid.status, 400);
const valid = await fetch(`${base}/api/calculate`, {
  method: "POST",
  headers,
  body: JSON.stringify(demoInput),
});
assert.equal(valid.status, 200);
assert.equal((await valid.json()).pillars.length, 4);
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL_UNPOOLED,
});
await client.connect();
try {
  let chartId: string;
  const existing = await client.query(
    "SELECT id FROM astrowed.charts WHERE title = $1 LIMIT 1",
    ["Демо · Astrowed"],
  );
  if (existing.rows.length) chartId = existing.rows[0].id;
  else {
    const save = await fetch(`${base}/api/charts`, {
      method: "POST",
      headers,
      body: JSON.stringify({ ...demoInput, name: "Демо · Astrowed" }),
    });
    assert.equal(save.status, 201, await save.clone().text());
    chartId = (await save.json()).id;
  }
  const saved = await client.query(
    'SELECT "clientId", result FROM astrowed.charts WHERE id=$1',
    [chartId],
  );
  assert.equal(saved.rows[0].result.pillars.length, 4);
  const page = await fetch(`${base}/chart/${chartId}`, { headers });
  assert.equal(page.status, 200);
  assert.ok((await page.text()).includes("Демо · Astrowed"));
  const privatePage = await fetch(`${base}/clients`, { redirect: "manual" });
  const privateHtml = await privatePage.text();
  assert.ok(
    privatePage.status === 307 || privateHtml.includes("NEXT_REDIRECT"),
  );
  assert.ok(!privateHtml.includes("Демо · Astrowed"));
  const academy = await fetch(`${base}/knowledge`);
  assert.equal(academy.status, 200);
  assert.ok((await academy.text()).includes("Дерево"));
  await client.query("BEGIN");
  const testId = randomUUID();
  await client.query(
    'INSERT INTO astrowed.consultations(id,"clientId",date,topic,notes) VALUES($1,$2,$3,$4,$5)',
    [
      testId,
      saved.rows[0].clientId,
      "2026-09-25",
      "Integration verification",
      "Rollback-only test",
    ],
  );
  assert.equal(
    (
      await client.query("SELECT id FROM astrowed.consultations WHERE id=$1", [
        testId,
      ])
    ).rowCount,
    1,
  );
  await client.query("ROLLBACK");
  const pdf = await fetch(`${base}/api/reports/${chartId}`, {
    method: "POST",
    headers,
  });
  assert.equal(pdf.status, 200, await pdf.clone().text());
  const bytes = Buffer.from(await pdf.arrayBuffer());
  assert.equal(bytes.subarray(0, 4).toString(), "%PDF");
  await mkdir("artifacts", { recursive: true });
  await writeFile("artifacts/demo-report.pdf", bytes);
  console.log(
    JSON.stringify({
      checks: 10,
      passed: true,
      demoChartId: chartId,
      pdfBytes: bytes.length,
      report: "artifacts/demo-report.pdf",
    }),
  );
} finally {
  await client.end();
}
