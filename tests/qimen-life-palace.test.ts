import { describe, expect, it } from "vitest";
import { demoInput } from "../src/domain/bazi/engine";
import { calculateQimen } from "../src/domain/qimen/engine";
import { findLifePalace } from "../src/domain/qimen/life-palace";

describe("Qi Men Life Palace", () => {
  it("uses the day stem on the heaven plate, independently of the Life Door", () => {
    const chart = calculateQimen(demoInput);
    chart.pillars[2] = "丙寅";
    chart.palaces = chart.palaces.map((p) => ({
      ...p,
      heaven: p.id === 4 ? "丙" : "戊",
      earth: p.id === 1 ? "丙" : "己",
      hosted: "",
      door: p.id === 2 ? "生" : "休",
    }));
    expect(findLifePalace(chart)?.id).toBe(4);
  });

  it.each([
    ["甲子", "戊"],
    ["甲戌", "己"],
    ["甲申", "庚"],
    ["甲午", "辛"],
    ["甲辰", "壬"],
    ["甲寅", "癸"],
  ])("finds the concealed instrument for day %s", (pillar, stem) => {
    const chart = calculateQimen(demoInput);
    chart.pillars[2] = pillar;
    const life = findLifePalace(chart);
    expect(life?.stem).toBe(stem);
    expect(life?.id).not.toBe(5);
    const palace = chart.palaces.find((p) => p.id === life?.id);
    expect([palace?.heaven, palace?.hosted]).toContain(stem);
  });

  it("follows the centre's travelling host instead of highlighting the centre", () => {
    const chart = calculateQimen(demoInput);
    chart.pillars[2] = "丁卯";
    chart.palaces = chart.palaces.map((p) => ({
      ...p,
      heaven: p.id === 5 ? "丁" : "戊",
      hosted: p.id === 7 ? "丁" : "",
    }));
    expect(findLifePalace(chart)).toMatchObject({
      id: 7,
      hosted: true,
      stem: "丁",
    });
  });

  it.each(["yin", "yang"] as const)(
    "finds one outer palace for every %s ju",
    (dun) => {
      for (let ju = 1; ju <= 9; ju++) {
        const chart = calculateQimen(demoInput, { system: "manual", ju, dun });
        const life = findLifePalace(chart);
        expect(life).not.toBeNull();
        expect(life?.id).not.toBe(5);
        expect(
          chart.palaces.filter(
            (p) =>
              p.id !== 5 &&
              (p.heaven === life?.stem || p.hosted === life?.stem),
          ),
        ).toHaveLength(1);
      }
    },
  );

  it("does not invent a palace when the day pillar is missing", () => {
    const chart = calculateQimen(demoInput);
    chart.pillars[2] = "";
    expect(findLifePalace(chart)).toBeNull();
  });
});
