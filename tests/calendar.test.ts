import { describe, it, expect } from "vitest";
import { LunarUtil } from "lunar-typescript";
import { activities, deityNames } from "../src/domain/calendar/catalog";
import {
  calculateCalendarDay,
  calculateCalendarMonth,
  activityState,
} from "../src/domain/calendar/engine";

describe("Chinese monthly calendar", () => {
  it("handles leap years, weekday alignment and both range boundaries", () => {
    expect(calculateCalendarMonth(2024, 2)).toHaveLength(29);
    expect(calculateCalendarMonth(2025, 2)).toHaveLength(28);
    const september = calculateCalendarMonth(2026, 9);
    expect(september).toHaveLength(30);
    expect(september[0].weekday).toBe(1);
    expect(september.at(-1)?.date).toBe("2026-09-30");
    expect(calculateCalendarMonth(1901, 1)).toHaveLength(31);
    expect(calculateCalendarMonth(2099, 12)).toHaveLength(31);
  });
  it("rejects invalid dates rather than silently normalizing them", () => {
    for (const args of [
      [2026, 2, 29],
      [2026, 13, 1],
      [2026, 0, 1],
      [1900, 1, 1],
      [2100, 1, 1],
      [NaN, 1, 1],
      [2026, 1.5, 1],
      [2026, 1, 0],
    ])
      expect(() =>
        calculateCalendarDay(...(args as [number, number, number])),
      ).toThrow();
  });
  it("matches HKO 2026 lunar calendar fixtures", () => {
    // https://www.hko.gov.hk/en/gts/time/calendar/pdf/files/2026e.pdf
    expect(calculateCalendarDay(2026, 2, 17)).toMatchObject({
      lunarDay: 1,
      lunarMonth: 1,
      lunarYear: 2026,
    });
    expect(calculateCalendarDay(2026, 9, 11)).toMatchObject({
      lunarDay: 1,
      lunarMonth: 8,
    });
    expect(calculateCalendarDay(2026, 9, 25)).toMatchObject({
      lunarDay: 15,
      lunarMonth: 8,
    });
    expect(calculateCalendarDay(2026, 9, 23).term).toMatchObject({
      han: "秋分",
      changesMonth: false,
    });
  });
  it("retains intercalary lunar months", () => {
    expect(calculateCalendarDay(2023, 3, 22)).toMatchObject({
      lunarDay: 1,
      lunarMonth: -2,
    });
  });
  it("matches public calendar pillars and officer fixtures", () => {
    // Public Mingli calendar inspected 2026-09-26; Yi/Ji schools differ.
    const day = calculateCalendarDay(2026, 9, 3);
    expect(day).toMatchObject({ pillar: "庚辰", animal: 4, lunarDay: 22 });
    expect(day.profiles[0]).toMatchObject({
      officer: 8,
      monthPillar: "丙申",
      yearPillar: "丙午",
    });
    const clash = calculateCalendarDay(2026, 9, 26).profiles[0];
    expect(clash.officer).toBe(6);
    expect(clash.flags.map((f) => f.id)).toEqual(
      expect.arrayContaining(["clash-месяца", "sha-месяца"]),
    );
  });
  it("splits a solar-month transition and Li Chun at the exact time", () => {
    const dew = calculateCalendarDay(2026, 9, 7);
    expect(dew.term?.han).toBe("白露");
    expect(dew.profiles).toHaveLength(2);
    expect(dew.profiles.map((p) => p.officer)).toEqual([0, 11]);
    expect(dew.profiles[0].until).toBe(dew.profiles[1].from);
    expect(dew.profiles[1].from).toBe(dew.term?.time);
    const spring = calculateCalendarDay(2026, 2, 4);
    expect(spring.profiles.map((p) => p.yearPillar)).toEqual(["乙巳", "丙午"]);
    expect(calculateCalendarDay(2026, 9, 23).profiles).toHaveLength(1);
  });
  it("has Russian explanations for every possible activity and deity", () => {
    for (const han of LunarUtil.YI_JI) {
      expect(activities[han], han).toBeDefined();
      expect(activities[han]?.meaning.length).toBeGreaterThan(15);
    }
    for (const han of LunarUtil.TIAN_SHEN.filter(Boolean))
      expect(deityNames[han], han).toBeTruthy();
  });
  it("does not mark absent actions as good and respects general restrictions", () => {
    const p = calculateCalendarDay(2026, 9, 3).profiles[0];
    expect(activityState(p, "嫁娶")).toBe("good");
    expect(activityState(p, "安葬")).toBe("bad");
    expect(activityState({ ...p, good: [], bad: [] }, "开市")).toBe("neutral");
    expect(
      activityState({ ...p, good: ["开市"], bad: ["诸事不宜"] }, "开市"),
    ).toBe("bad");
    expect(
      activityState({ ...p, good: ["扫舍", "馀事勿取"], bad: [] }, "扫舍"),
    ).toBe("good");
    expect(
      activityState({ ...p, good: ["扫舍", "馀事勿取"], bad: [] }, "开市"),
    ).toBe("bad");
  });
});
