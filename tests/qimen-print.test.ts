import { describe, expect, it } from "vitest";
import { demoInput } from "../src/domain/bazi/engine";
import { calculateQimen } from "../src/domain/qimen/engine";
import { qimenPrintSvg } from "../src/services/qimen-print";

describe("Qi Men printable sheet", () => {
  it.each(["chaibu", "manual"] as const)(
    "includes all nine palaces in Luo Shu order for %s",
    (system) => {
      const chart = calculateQimen(demoInput, { system, ju: 9, dun: "yin" });
      const svg = qimenPrintSvg(chart);
      expect(
        [...svg.matchAll(/data-palace="(\d)"/g)].map((m) => Number(m[1])),
      ).toEqual([4, 9, 2, 3, 5, 7, 8, 1, 6]);
      for (const palace of chart.palaces) {
        const cell = svg
          .split(`data-palace="${palace.id}"`)[1]
          .split("</g>")[0];
        for (const symbol of [
          palace.heaven,
          palace.earth,
          palace.door,
          palace.star,
          palace.spirit,
          palace.hosted,
        ].filter(Boolean)) {
          expect(cell).toContain(symbol);
        }
      }
      expect(svg).toContain(chart.localTime);
      expect(svg).toContain(chart.input.date);
      expect(svg).toContain(chart.input.time);
      for (const direction of [
        "ЮГ",
        "СЕВЕР",
        "ВОСТОК",
        "ЗАПАД",
        "ЮВ",
        "ЮЗ",
        "СВ",
        "СЗ",
      ])
        expect(svg).toContain(`>${direction}</text>`);
    },
  );

  it("escapes user labels without turning them into SVG markup", () => {
    const chart = calculateQimen(demoInput);
    chart.input.name = '<script>alert("name")</script> & Имя';
    chart.input.city = '<image href="https://example.com/x" />';
    const svg = qimenPrintSvg(chart);
    expect(svg).not.toContain("<script");
    expect(svg).not.toContain("<image");
    expect(svg).toContain("&lt;script&gt;");
    expect(svg).toContain("&amp; Имя");
  });
});
