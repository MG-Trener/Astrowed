import { describe, it, expect } from "vitest";
import { emptyBirthInput, restoreChart } from "../src/domain/bazi/session";
import { calculateNew } from "../src/domain/bazi/engine";

describe("personal chart session", () => {
  it("starts without a fabricated birth date, time or place", () => {
    expect([
      emptyBirthInput.date,
      emptyBirthInput.time,
      emptyBirthInput.city,
      emptyBirthInput.timezone,
    ]).toEqual(["", "", "", ""]);
    expect(restoreChart(null)).toBeNull();
  });
  it("rebuilds the selected date and hour instead of a demo chart", () => {
    const input = {
      ...emptyBirthInput,
      name: "Session test",
      date: "1989-07-12",
      time: "17:15",
      city: "Test location",
      timezone: "Europe/Moscow",
      longitude: 30.3,
      latitude: 60,
    };
    const first = calculateNew(input);
    const restored = restoreChart(JSON.stringify(first.input));
    expect(restored?.input.date).toBe(input.date);
    expect(restored?.pillars).toEqual(first.pillars);
    const second = restoreChart(
      JSON.stringify({ ...input, date: "2001-01-09", time: "06:20" }),
    );
    expect(second?.input.date).toBe("2001-01-09");
    expect(second?.pillars).not.toEqual(first.pillars);
  });
  it("does not replace missing/corrupt data with an invented result", () => {
    for (const raw of [
      "{}",
      "null",
      "broken json",
      JSON.stringify(emptyBirthInput),
    ])
      expect(restoreChart(raw)).toBeNull();
  });
  it("retains an unknown hour after navigation", () => {
    const chart = restoreChart(
      JSON.stringify({
        ...emptyBirthInput,
        name: "Unknown hour",
        date: "1984-08-10",
        time: "12:00",
        unknownTime: true,
        city: "Test location",
        timezone: "Asia/Almaty",
        longitude: 76.9,
        latitude: 43.2,
      }),
    );
    expect(chart?.input.unknownTime).toBe(true);
    expect(chart?.pillars.some((p) => p.key === "hour")).toBe(false);
  });
});
