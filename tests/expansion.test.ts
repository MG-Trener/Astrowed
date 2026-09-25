import { describe, it, expect } from "vitest";
import { calculate, demoInput } from "../src/domain/bazi/engine";
import { calculateQimen } from "../src/domain/qimen/engine";
import { calculateGua, guaForYear } from "../src/domain/feng-shui/gua";
import {
  currentEnergies,
  lifeYears,
  symbolicStars,
  periodRelations,
} from "../src/domain/bazi/extended";
import { reportHtml } from "../src/services/report-template";
const base = {
  ...demoInput,
  timezone: "Asia/Shanghai",
  city: "Пекин",
  dayBoundary: "zi" as const,
};
describe("Qi Men rotating plate reference layouts", () => {
  // Public reference layouts: atopx/qimen qimen_golden_test.go; actual solar
  // term Chai Bu is used here. Check every palace rather than just the leaders.
  it("matches the Yang 8 layout on 2026-01-14 18:45", () => {
    const q = calculateQimen({ ...base, date: "2026-01-14", time: "18:45" });
    expect([
      q.dun,
      q.ju,
      q.dutyStar,
      q.starTarget,
      q.dutyDoor,
      q.doorTarget,
    ]).toEqual(["yang", 8, "天辅", 2, "杜", 2]);
    expect(q.palaces.map((p) => p.heaven + p.earth)).toEqual([
      "乙庚",
      "癸辛",
      "庚壬",
      "戊癸",
      "丁丁",
      "辛丙",
      "己乙",
      "丙戊",
      "壬己",
    ]);
    expect(q.palaces.map((p) => p.door)).toEqual([
      "惊",
      "杜",
      "休",
      "生",
      "",
      "死",
      "景",
      "开",
      "伤",
    ]);
    expect(q.palaces.map((p) => p.spirit)).toEqual([
      "六合",
      "值符",
      "玄武",
      "九地",
      "",
      "太阴",
      "腾蛇",
      "白虎",
      "九天",
    ]);
  });
  it("matches Yin 2 and the reverse spirit order", () => {
    const q = calculateQimen({ ...base, date: "2026-10-31", time: "12:02" });
    expect([
      q.dun,
      q.ju,
      q.dutyStar,
      q.starTarget,
      q.dutyDoor,
      q.doorTarget,
    ]).toEqual(["yin", 2, "天心", 2, "开", 2]);
    expect(q.palaces.map((p) => p.heaven + p.earth)).toEqual([
      "乙己",
      "癸戊",
      "庚乙",
      "戊丙",
      "丁丁",
      "辛癸",
      "己壬",
      "丙辛",
      "壬庚",
    ]);
    expect(q.palaces.map((p) => p.spirit)).toEqual([
      "玄武",
      "值符",
      "六合",
      "太阴",
      "",
      "九地",
      "九天",
      "白虎",
      "腾蛇",
    ]);
  });
  it("retains palace 5 as the start of duty-door counting before hosting", () => {
    const q = calculateQimen(
      { ...base, date: "2026-03-02", time: "18:30" },
      { system: "manual", ju: 3, dun: "yang" },
    );
    expect([q.dutyStar, q.starTarget, q.doorTarget]).toEqual(["天禽", 2, 6]);
    expect(q.palaces.filter((p) => p.hosted)).toHaveLength(1);
    expect(q.palaces[4].door).toBe("");
  });
  it("does not silently calculate without a time or valid manual ju", () => {
    expect(() => calculateQimen({ ...base, unknownTime: true })).toThrow();
    expect(() =>
      calculateQimen(base, { system: "manual", ju: 10, dun: "yang" }),
    ).toThrow();
  });
  it("uses the actual solar transition, independent of display timezone", () => {
    const china = calculateQimen({
      ...base,
      date: "2026-02-04",
      time: "05:00",
    });
    const utc = calculateQimen({
      ...base,
      date: "2026-02-03",
      time: "21:00",
      timezone: "UTC",
    });
    expect(china.term).toBe(utc.term);
    expect(china.utc).toBe(utc.utc);
  });
});
describe("Gua and extended Ba Zi", () => {
  it("matches published Gua examples, including the century and number 5", () => {
    expect(guaForYear(2000, "female").number).toBe(6);
    expect(guaForYear(2003, "male").number).toBe(6);
    expect(guaForYear(1990, "female").number).toBe(8);
    expect(guaForYear(1995, "male").number).toBe(2);
    expect(guaForYear(2000, "male").directions.map((p) => p.id)).toHaveLength(
      8,
    );
  });
  it("changes Gua at Li Chun rather than January 1", () => {
    expect(calculateGua({ ...base, date: "2000-01-01" }).year).toBe(1999);
    expect(calculateGua({ ...base, date: "2000-03-01" }).year).toBe(2000);
  });
  it("keeps each marker's basis and actual positions", () => {
    const chart = calculate(base),
      stars = symbolicStars(chart);
    for (const row of stars.filter((r) => r.kind === "star"))
      for (const pos of row.positions)
        expect(row.target).toContain(
          chart.pillars.find((p) => p.label === pos)!.branch,
        );
    expect(stars.find((r) => r.han === "劫財")?.kind).toBe("marker");
    expect(stars.filter((r) => r.han === "桃花")).toHaveLength(2);
  });
  it("does not mix natal-only relations into the selected time layer", () => {
    const c = calculate(base),
      rels = periodRelations(c, "甲子");
    for (const r of rels)
      expect(r.symbols.includes("甲") || r.symbols.includes("子")).toBe(true);
    expect(lifeYears(c)).toHaveLength(100);
    expect(currentEnergies(c, "2026-09-25")).toHaveLength(4);
  });
});
describe("report content and escaping", () => {
  it("includes nine palaces and contact links only in the full report", () => {
    const c = calculate(base);
    const brief = reportHtml(c, { level: "brief", date: "2026-09-25" }),
      full = reportHtml(c, { level: "full", date: "2026-09-25" });
    expect(brief).not.toContain("06 / Личная карта Ци Мэнь");
    expect(full).toContain("06 / Личная карта Ци Мэнь");
    expect(full).toContain("https://wa.me/77777644655");
    expect(full).toContain("Юлия Гаврилычева");
  });
  it("escapes birth names and consultant comments", () => {
    const html = reportHtml(
      calculate({ ...base, name: "<script>alert(1)</script>" }),
      { comment: "<img src=x onerror=alert(1)>", date: "2026-09-25" },
    );
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;img");
  });
});
