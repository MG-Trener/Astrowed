import { describe, expect, it } from "vitest";
import { calculate, demoInput, normalizeTime } from "../src/domain/bazi/engine";

// Independent conventional two-hour intervals, not values read from the library.
const hours = [
  ["23:00", "00:59", "子", "Крыса"],
  ["01:00", "02:59", "丑", "Бык"],
  ["03:00", "04:59", "寅", "Тигр"],
  ["05:00", "06:59", "卯", "Кролик"],
  ["07:00", "08:59", "辰", "Дракон"],
  ["09:00", "10:59", "巳", "Змея"],
  ["11:00", "12:59", "午", "Лошадь"],
  ["13:00", "14:59", "未", "Коза"],
  ["15:00", "16:59", "申", "Обезьяна"],
  ["17:00", "18:59", "酉", "Петух"],
  ["19:00", "20:59", "戌", "Собака"],
  ["21:00", "22:59", "亥", "Свинья"],
] as const;
const astana = {
  ...demoInput,
  city: "Астана",
  timezone: "Asia/Almaty",
  longitude: 71.43,
  latitude: 51.13,
};
function hour(
  date: string,
  time: string,
  timeMode: "civil" | "mean-solar" = "civil",
) {
  return calculate({ ...astana, date, time, timeMode }).pillars.find(
    (p) => p.key === "hour",
  )!;
}

describe("independent audit of hour branches", () => {
  it.each(hours)(
    "%s–%s maps to %s / %s at both edges for either day boundary",
    (start, end, branch, animal) => {
      for (const time of [start, end])
        for (const dayBoundary of ["midnight", "zi"] as const) {
          const pillar = calculate({
            ...astana,
            date: "2020-01-15",
            time,
            dayBoundary,
          }).pillars[3];
          expect(pillar.branch).toBe(branch);
          expect(pillar.animal).toBe(animal);
        }
    },
  );
  it("keeps both early and late Zi in the same earthly branch across midnight", () => {
    for (const time of ["23:00", "23:59", "00:00", "00:59"])
      expect(hour("2020-01-15", time).branch).toBe("子");
  });
  it("reconstructs the photographed Astana table only for UTC+6 mean solar time", () => {
    const time = normalizeTime({
      ...astana,
      date: "2020-01-15",
      time: "09:30",
      timeMode: "mean-solar",
    });
    expect(time.correctionMinutes).toBeCloseTo(-74.28, 8);
    expect(time.local.toFormat("HH:mm:ss")).toBe("08:15:43");
    expect(hour("2020-01-15", "09:30", "civil").branch).toBe("巳");
    expect(hour("2020-01-15", "09:30", "mean-solar").branch).toBe("辰");
    expect(hour("2020-01-15", "00:14", "mean-solar").branch).toBe("亥");
    expect(hour("2020-01-15", "00:15", "mean-solar").branch).toBe("子");
    expect(hour("2020-01-15", "02:14", "mean-solar").branch).toBe("子");
    expect(hour("2020-01-15", "02:15", "mean-solar").branch).toBe("丑");
  });
  it("moves Astana civil-clock boundaries one hour earlier after the 2024 reform", () => {
    const time = normalizeTime({
      ...astana,
      date: "2025-01-15",
      time: "09:30",
      timeMode: "mean-solar",
    });
    expect(time.correctionMinutes).toBeCloseTo(-14.28, 8);
    expect(time.local.toFormat("HH:mm:ss")).toBe("09:15:43");
    expect(hour("2025-01-15", "09:30", "mean-solar").branch).toBe("巳");
    expect(hour("2025-01-15", "23:14", "mean-solar").branch).toBe("亥");
    expect(hour("2025-01-15", "23:15", "mean-solar").branch).toBe("子");
    expect(hour("2025-01-15", "01:14", "mean-solar").branch).toBe("子");
    expect(hour("2025-01-15", "01:15", "mean-solar").branch).toBe("丑");
  });
});
