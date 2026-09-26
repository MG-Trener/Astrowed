import { describe, expect, it } from "vitest";
import { Solar, LunarUtil } from "lunar-typescript";
import { DateTime } from "luxon";
import {
  assessHour,
  calculateHourWindows,
  calculateLocalDay,
  calculateLocalMonth,
  defaultClock,
} from "../src/domain/calendar/hours";

describe("local calendar hours", () => {
  it("covers an ordinary civil day with 13 continuous periods", () => {
    const hours = calculateHourWindows("2026-09-27", defaultClock);
    expect(hours).toHaveLength(13);
    expect(hours[0].from).toBe("00:00");
    expect(hours.at(-1)?.until).toBe("24:00");
    expect(hours[0].pillar).toBe("甲子");
    expect(hours[1].pillar).toBe("乙丑");
    expect(hours.map((h) => h.end - h.start).reduce((a, b) => a + b, 0)).toBe(
      86400000,
    );
    hours.slice(1).forEach((h, i) => expect(h.start).toBe(hours[i].end));
  });
  it("distinguishes the midnight and Zi day boundaries at 23:00", () => {
    const midnight = calculateHourWindows("2026-09-27", defaultClock).at(-1)!;
    const zi = calculateHourWindows("2026-09-27", {
      ...defaultClock,
      dayBoundary: "zi",
    }).at(-1)!;
    expect(midnight.dayPillar).toBe("甲辰");
    expect(midnight.pillar).toBe("甲子");
    expect(zi.dayPillar).toBe("乙巳");
    expect(zi.pillar).toBe("丙子");
    expect(zi.calendarDate).toBe("2026-09-28");
  });
  it("matches library hour pillars and tables away from the chosen midnight convention", () => {
    const hours = calculateHourWindows("2026-09-27", defaultClock);
    for (const window of hours.slice(0, -1)) {
      const local = DateTime.fromMillis((window.start + window.end) / 2, {
        zone: defaultClock.timezone,
      });
      const lunar = Solar.fromYmdHms(
        2026,
        9,
        27,
        local.hour,
        local.minute,
        0,
      ).getLunar();
      expect(window.pillar).toBe(lunar.getTimeInGanZhi());
      expect(window.deity).toBe(lunar.getTimeTianShen());
      expect(window.good).toEqual(lunar.getTimeYi().filter((x) => x !== "无"));
    }
  });
  it("uses the actual solar-term instant in the city's clock", () => {
    const day = calculateLocalDay("2026-09-07", defaultClock);
    expect(day.term?.time).toBe("19:41:16");
    expect(day.profiles.map((p) => p.monthPillar)).toEqual(["丙申", "丁酉"]);
    const windows = calculateHourWindows("2026-09-07", defaultClock);
    const after = windows.find((w) => w.from === "19:41:16")!;
    expect(after.profile.monthPillar).toBe("丁酉");
  });
  it("applies longitude correction without converting output labels to solar time", () => {
    const options = { ...defaultClock, timeMode: "mean-solar" as const };
    const hours = calculateHourWindows("2026-09-27", options);
    // Astana solar clock is about 14 minutes behind civil UTC+5.
    expect(hours.some((h) => h.from.startsWith("01:14:"))).toBe(true);
    expect(hours[0].calendarDate).toBe("2026-09-26");
    expect(hours[0].dayPillar).toBe("癸卯");
    expect(hours.find((h) => h.from.startsWith("00:14:"))?.dayPillar).toBe(
      "甲辰",
    );
  });
  it("keeps DST gaps and folds continuous in absolute time", () => {
    const options = {
      ...defaultClock,
      city: "Нью-Йорк",
      timezone: "America/New_York",
      longitude: -74.006,
    };
    for (const [date, duration] of [
      ["2026-03-08", 23],
      ["2026-11-01", 25],
    ] as const) {
      const windows = calculateHourWindows(date, options);
      expect(windows.reduce((sum, w) => sum + w.end - w.start, 0)).toBe(
        duration * 3600000,
      );
      windows.slice(1).forEach((w, i) => expect(w.start).toBe(windows[i].end));
      expect(windows.every((w) => w.end > w.start)).toBe(true);
    }
    const fold = calculateHourWindows("2026-11-01", options);
    expect(new Set(fold.map((w) => w.offset)).size).toBe(2);
  });
  it("splits a half-hour clock rollback at its exact instant", () => {
    const windows = calculateHourWindows("2026-04-05", {
      ...defaultClock,
      city: "Лорд-Хау",
      timezone: "Australia/Lord_Howe",
      longitude: 159.08,
    });
    const rollback = windows.find((w) => w.from === "01:30");
    expect(rollback?.offset).toBe("+10:30");
    const preceding = windows.find((w) => w.end === rollback?.start);
    expect(preceding?.offset).toBe("+11:00");
    expect(preceding?.until).toBe("01:30");
    expect(windows.reduce((sum, w) => sum + w.end - w.start, 0)).toBe(
      24.5 * 3600000,
    );
  });
  it("does not let a positive hour cancel a restricted day", () => {
    const hours = calculateHourWindows("2026-09-27", defaultClock);
    for (const h of hours)
      for (const activity of ["嫁娶", "出行", "开市"])
        expect(assessHour(h, activity).tone).toBe("bad");
    const supported = hours.find((h) => h.good.includes("开市"));
    expect(supported).toBeDefined();
    expect(
      assessHour(supported!, "开市").reasons.some((r) => r.tone === "good"),
    ).toBe(true);
  });
  it("never invents support from an empty activity table", () => {
    const h = calculateHourWindows("2026-09-27", defaultClock)[0];
    const clean = {
      ...h,
      good: [],
      bad: [],
      clash: false,
      empty: false,
      deityGood: true,
      profile: {
        ...h.profile,
        good: [],
        bad: [],
        officer: 3,
        flags: [],
        deityGood: true,
      },
    };
    expect(assessHour(clean, "栽种").tone).toBe("neutral");
  });
  it("calculates every date of a requested month and rejects invalid input", () => {
    expect(calculateLocalMonth(2024, 2, defaultClock)).toHaveLength(29);
    expect(() => calculateHourWindows("2026-02-30", defaultClock)).toThrow();
    expect(() =>
      calculateHourWindows("2026-09-27", {
        ...defaultClock,
        timezone: "invalid",
      }),
    ).toThrow();
    expect(() =>
      calculateHourWindows("2026-09-27", { ...defaultClock, longitude: NaN }),
    ).toThrow();
    expect(() => calculateLocalMonth(2026, 13, defaultClock)).toThrow();
  });
});
