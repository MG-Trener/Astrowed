import { describe, it, expect } from "vitest";
import { Solar } from "lunar-typescript";
import { DateTime } from "luxon";
import {
  calculate,
  demoInput,
  normalizeTime,
  annualPillar,
} from "../src/domain/bazi/engine";
import type { BirthInput } from "../src/domain/bazi/types";
import fixtures from "./reference-charts/fixtures.json";
const base = {
  ...demoInput,
  city: "Пекин",
  timezone: "Asia/Shanghai",
  longitude: 116.407,
  latitude: 39.904,
};
describe("calendar reference charts", () => {
  for (const ref of fixtures.charts)
    it(`${ref.date} ${ref.time} ${ref.dayBoundary}`, () => {
      expect(
        calculate({
          ...base,
          ...ref,
          dayBoundary: ref.dayBoundary as BirthInput["dayBoundary"],
        }).pillars.map((p) => p.stem + p.branch),
      ).toEqual(ref.expected);
    });
  it("does not silently normalize an invalid date", () => {
    expect(() => calculate({ ...base, date: "2023-02-29" })).toThrow();
    expect(() => calculate({ ...base, date: "2024-02-29" })).not.toThrow();
  });
  it("rejects unsupported range and invalid coordinates", () => {
    expect(() => calculate({ ...base, date: "1800-01-01" })).toThrow();
    expect(() => calculate({ ...base, longitude: 181 })).toThrow();
  });
  it("returns hidden stems and relative ten gods", () => {
    const c = calculate({ ...base, date: "2005-12-23", time: "08:37" });
    expect(c.pillars[2].hidden).toEqual(["丙", "庚", "戊"]);
    expect(c.pillars[0].tenGod).toBe("Косвенное богатство");
    expect(c.pillars[3].tenGod).toBe("Вызов власти");
  });
  it("distinguishes day boundary at late Zi", () => {
    const c = calculate({ ...base, date: "1988-02-15", time: "23:30" });
    const z = calculate({
      ...base,
      date: "1988-02-15",
      time: "23:30",
      dayBoundary: "zi",
    });
    expect(c.dayMaster.stem).not.toBe(z.dayMaster.stem);
  });
  it("omits invented hour and Da Yun for unknown birth time", () => {
    const c = calculate({ ...base, unknownTime: true });
    expect(c.pillars).toHaveLength(3);
    expect(c.luck).toEqual([]);
    expect(c.luckStart).toBeNull();
  });
  it("returns deterministic, versioned snapshots", () => {
    expect(calculate(base)).toEqual(calculate(base));
    expect(calculate(base).method.engineVersion).toContain("1.8.6");
  });
  it("normalizes element shares and forms consecutive decade periods", () => {
    const c = calculate(base);
    expect(
      Object.values(c.distribution).reduce((a, b) => a + b, 0),
    ).toBeCloseTo(100, 0);
    expect(c.luck).toHaveLength(9);
    expect(c.luck[1].startYear).toBe(c.luck[0].startYear + 10);
  });
  it("uses the 60-year annual cycle", () => {
    expect(annualPillar(2026)).toBe("丙午");
    expect(annualPillar(1984)).toBe("甲子");
    expect(annualPillar(2044)).toBe("甲子");
  });
});
describe("timezone, DST and solar corrections", () => {
  it("rejects a spring DST gap", () => {
    expect(() =>
      calculate({
        ...base,
        timezone: "America/New_York",
        date: "2024-03-10",
        time: "02:30",
      }),
    ).toThrow("отсутствует");
  });
  it("requires a choice for a repeated autumn hour", () => {
    expect(() =>
      calculate({
        ...base,
        timezone: "America/New_York",
        date: "2024-11-03",
        time: "01:30",
      }),
    ).toThrow("дважды");
    const data = {
      ...base,
      timezone: "America/New_York",
      date: "2024-11-03",
      time: "01:30",
    };
    const a = normalizeTime({ ...data, dstChoice: "earlier" }),
      b = normalizeTime({ ...data, dstChoice: "later" });
    expect(b.civil.toMillis() - a.civil.toMillis()).toBe(3600000);
  });
  it("uses historical Kazakhstan offsets", () => {
    expect(
      normalizeTime({ ...base, timezone: "Asia/Almaty", date: "2024-02-20" })
        .civil.offset,
    ).toBe(360);
    expect(
      normalizeTime({ ...base, timezone: "Asia/Almaty", date: "2024-03-20" })
        .civil.offset,
    ).toBe(300);
  });
  it("applies longitude correction and can cross a civil date", () => {
    const c = calculate({
      ...base,
      date: "2024-05-01",
      time: "00:30",
      longitude: 90,
      timeMode: "mean-solar",
    });
    expect(c.method.correctionMinutes).toBe(-120);
    expect(c.method.localTime).toBe("2024-04-30 22:30");
  });
  it("switches year exactly at Li Chun in any timezone", () => {
    const term = Solar.fromYmd(2024, 2, 4).getLunar().getJieQiTable()["立春"];
    const instant = DateTime.fromSQL(term.toYmdHms(), { zone: "UTC+8" });
    for (const zone of ["Asia/Shanghai", "Europe/Moscow", "America/New_York"]) {
      const before = instant.minus({ minutes: 1 }).setZone(zone),
        after = instant.plus({ minutes: 1 }).setZone(zone);
      const a = calculate({
          ...base,
          timezone: zone,
          date: before.toISODate()!,
          time: before.toFormat("HH:mm"),
        }),
        b = calculate({
          ...base,
          timezone: zone,
          date: after.toISODate()!,
          time: after.toFormat("HH:mm"),
        });
      expect(a.pillars[0].stem + a.pillars[0].branch).toBe("癸卯");
      expect(b.pillars[0].stem + b.pillars[0].branch).toBe("甲辰");
      expect(a.pillars[1].branch).toBe("丑");
      expect(b.pillars[1].branch).toBe("寅");
    }
  });
  it("switches month at Jing Zhe rather than March 1", () => {
    const term = Solar.fromYmd(2024, 3, 5).getLunar().getJieQiTable()["惊蛰"];
    const instant = DateTime.fromSQL(term.toYmdHms(), { zone: "UTC+8" });
    const before = instant.minus({ minutes: 1 }),
      after = instant.plus({ minutes: 1 });
    expect(
      calculate({
        ...base,
        date: before.toISODate()!,
        time: before.toFormat("HH:mm"),
      }).pillars[1].branch,
    ).toBe("寅");
    expect(
      calculate({
        ...base,
        date: after.toISODate()!,
        time: after.toFormat("HH:mm"),
      }).pillars[1].branch,
    ).toBe("卯");
  });
});
