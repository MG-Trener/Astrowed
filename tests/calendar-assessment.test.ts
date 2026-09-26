import { describe, expect, it } from "vitest";
import {
  calculateCalendarDay,
  calculateCalendarMonth,
} from "../src/domain/calendar/engine";
import {
  assessActivity,
  assessDayActivities,
  assessedActivities,
} from "../src/domain/calendar/assessment";

describe("auditable calendar assessment", () => {
  it("resolves the September 27 contradiction without removing raw Yi evidence", () => {
    const day = calculateCalendarDay(2026, 9, 27);
    expect(day).toMatchObject({ pillar: "甲辰", lunarDay: 17 });
    const p = day.profiles[0];
    expect(p.flags.map((f) => f.id)).toContain("wealthless");
    for (const activity of ["嫁娶", "出行", "移徙"]) {
      expect(p.good).toContain(activity);
      const result = assessActivity(p, activity);
      expect(result.tone).toBe("bad");
      expect(result.conflict).toBe(true);
      expect(
        result.reasons.some((r) => r.id === "yi" && r.tone === "good"),
      ).toBe(true);
    }
    expect(
      assessActivity(p, "开市").reasons.some((r) => r.id === "wealthless"),
    ).toBe(true);
    // Taking up a job is not silently reclassified as a commercial transaction.
    expect(
      assessActivity(p, "赴任").reasons.some((r) => r.id === "wealthless"),
    ).toBe(false);
  });
  it("derives exactly the ten traditional wealthless pillars over a full cycle", () => {
    const days = [1, 2, 3]
      .flatMap((m) => calculateCalendarMonth(2026, m))
      .slice(0, 60);
    const found = days
      .filter((d) => d.profiles[0].flags.some((f) => f.id === "wealthless"))
      .map((d) => d.pillar)
      .sort();
    expect(found).toEqual(
      [
        "甲辰",
        "乙巳",
        "丙申",
        "丁亥",
        "戊戌",
        "己丑",
        "庚辰",
        "辛巳",
        "壬申",
        "癸亥",
      ].sort(),
    );
  });
  it("places seasonal markers on the prior civil day only", () => {
    expect(
      calculateCalendarDay(2026, 9, 22).profiles[0].flags.map((f) => f.id),
    ).toContain("separation");
    expect(
      calculateCalendarDay(2026, 9, 23).profiles[0].flags.map((f) => f.id),
    ).not.toContain("separation");
    expect(
      calculateCalendarDay(2026, 2, 3).profiles[0].flags.map((f) => f.id),
    ).toContain("exhaustion");
    expect(
      calculateCalendarDay(2026, 2, 4).profiles[0].flags.map((f) => f.id),
    ).not.toContain("exhaustion");
  });
  it("does not invent support from an auspicious background or turn daily chores into major launches", () => {
    const p = {
      ...calculateCalendarDay(2026, 9, 27).profiles[0],
      good: [],
      bad: [],
      officer: 3,
      deityGood: true,
    };
    expect(assessActivity(p, "扫舍").tone).toBe("neutral");
    expect(assessActivity({ ...p, good: ["扫舍"] }, "扫舍").tone).toBe("good");
    expect(
      assessActivity({ ...p, flags: [], deityGood: false }, "入学").tone,
    ).toBe("caution");
    expect(
      assessActivity({ ...p, good: ["扫舍"], bad: ["诸事不宜"] }, "扫舍").tone,
    ).toBe("bad");
    expect(
      assessActivity({ ...p, good: ["扫舍", "馀事勿取"] }, "扫舍").tone,
    ).toBe("good");
  });
  it("retains valid dismantling and groundwork exceptions", () => {
    const p = {
      ...calculateCalendarDay(2026, 9, 27).profiles[0],
      good: [],
      bad: [],
    };
    const demolition = assessActivity({ ...p, officer: 6 }, "拆卸");
    expect(demolition.tone).toBe("good");
    expect(
      assessActivity(p, "动土").reasons.find((r) => r.id === "officer")?.tone,
    ).toBe("good");
    expect(assessActivity(p, "安床").tone).toBe("good");
  });
  it("gives every red assessment a reason and never labels conflicting cases green", () => {
    for (const m of [1, 2, 3, 6, 9, 12])
      for (const day of calculateCalendarMonth(2026, m))
        for (const p of day.profiles) {
          const results = assessDayActivities(p);
          expect(results).toHaveLength(assessedActivities.length);
          for (const result of results) {
            if (result.tone === "bad")
              expect(result.reasons.some((r) => r.tone === "bad")).toBe(true);
            if (result.tone === "good") {
              expect(result.reasons.some((r) => r.tone === "good")).toBe(true);
              expect(
                result.reasons.some((r) => ["bad", "caution"].includes(r.tone)),
              ).toBe(false);
            }
            expect(new Set(result.reasons.map((r) => r.id)).size).toBe(
              result.reasons.length,
            );
          }
        }
  });
});
