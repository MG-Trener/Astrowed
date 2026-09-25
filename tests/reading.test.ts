import { describe, expect, it } from "vitest";
import { calculate, demoInput } from "../src/domain/bazi/engine";
import { buildReading } from "../src/domain/bazi/reading";
import { reportHtml } from "../src/services/report-template";

describe("Client reading and conclusion", () => {
  it("grounds every selected ten-god theme in an actual pillar", () => {
    const chart = calculate(demoInput);
    const reading = buildReading(chart);
    expect(reading).toEqual(buildReading(chart));
    for (const section of reading.sections.filter((s) =>
      s.id.startsWith("theme-"),
    )) {
      expect(section.evidence.length).toBeGreaterThan(0);
      for (const evidence of section.evidence) {
        expect(
          chart.pillars.some(
            (p) =>
              evidence.startsWith(p.label) &&
              (evidence.endsWith(p.tenGod) ||
                p.hiddenGods.some((g) => evidence.endsWith(g))),
          ),
        ).toBe(true);
      }
    }
  });
  it("changes the central metaphor when the birth day changes", () => {
    const a = buildReading(calculate({ ...demoInput, date: "1990-06-15" }));
    const b = buildReading(calculate({ ...demoInput, date: "1990-06-16" }));
    expect(a.sections[0].text).not.toBe(b.sections[0].text);
  });
  it("does not present unknown-hour results as a complete chart", () => {
    const reading = buildReading(
      calculate({ ...demoInput, unknownTime: true }),
    );
    expect(reading.facts).toHaveLength(3);
    expect(reading.boundaryNote).toContain("служебный полдень");
    expect(reading.conclusion.summary).toContain("Предварительный");
    expect(reading.sections.find((s) => s.id === "periods")?.text).toContain(
      "не рассчитывается",
    );
  });
  it("keeps equally represented elements instead of choosing an arbitrary winner", () => {
    const chart = calculate(demoInput);
    const keys = Object.keys(
      chart.distribution,
    ) as (keyof typeof chart.distribution)[];
    keys.forEach((key, i) => {
      chart.distribution[key] = i < 2 ? 50 : 0;
    });
    expect(
      buildReading(chart).sections.find((s) => s.id === "elements")?.text,
    ).toContain("50% каждый");
  });
  it("includes edited conclusions only in detailed reports and escapes user HTML", () => {
    const chart = calculate(demoInput);
    const conclusion = {
      ...buildReading(chart).conclusion,
      summary: '<script>alert("draft")</script>',
    };
    const full = reportHtml(chart, { level: "full", conclusion });
    expect(full).toContain("&lt;script&gt;");
    expect(full).not.toContain('<script>alert("draft")</script>');
    expect(full).toContain("Структурированное заключение");
    expect(reportHtml(chart, { level: "brief", conclusion })).not.toContain(
      "&lt;script&gt;",
    );
  });
});
