import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import {
  cityPlace,
  manualPlace,
  searchCities,
  type CityRow,
} from "../src/domain/locations";
import { normalizeTime, demoInput } from "../src/domain/bazi/engine";

const kz: CityRow[] = JSON.parse(
  readFileSync("public/locations/KZ.json", "utf8"),
);
describe("birth location selection", () => {
  it("displays modern Russian names while accepting historical aliases", () => {
    const ru: CityRow[] = JSON.parse(
      readFileSync("public/locations/RU.json", "utf8"),
    );
    const samara = searchCities(ru, "Самара")[0];
    expect(samara[1]).toBe("Самара");
    expect(
      searchCities(ru, "Куйбышев").some((row) => row[0] === samara[0]),
    ).toBe(true);
    expect(samara[2]).toContain("Самар");
  });
  it("finds a city outside the old shortlist by Cyrillic and Latin aliases", () => {
    const ru = searchCities(kz, "Темиртау")[0];
    const en = searchCities(kz, "Temirtau")[0];
    expect(ru[0]).toBe(en[0]);
    expect(cityPlace(ru)).toMatchObject({ timezone: "Asia/Almaty" });
    expect(ru[4]).toBeCloseTo(72.96, 1);
  });
  it("keeps identically named places separate, with exact matches before prefixes", () => {
    const rows: CityRow[] = [
      [1, "Aksu North", "A", 1, 2, "Asia/Almaty", 10000, "Aksu North"],
      [2, "Аксу", "B", 3, 4, "Asia/Almaty", 100, "Aksu|Аксу"],
      [3, "Аксу", "C", 5, 6, "Asia/Almaty", 10, "Aksu|Аксу"],
    ];
    expect(searchCities(rows, "Aksu").map((r) => r[0])).toEqual([2, 3, 1]);
    expect(searchCities(rows, "A")).toEqual([]);
  });
  it("does not accept incomplete manual coordinates or a nonexistent timezone", () => {
    expect(manualPlace("Деревня", "Asia/Almaty", "", "")).toBeNull();
    expect(manualPlace("Деревня", "Bad/Zone", "43", "77")).toBeNull();
    expect(manualPlace("Деревня", "Asia/Almaty", "91", "77")).toBeNull();
    expect(manualPlace("Нулевая точка", "UTC", "0", "0")).toMatchObject({
      latitude: 0,
      longitude: 0,
    });
  });
  it("applies historical UTC offsets, not a current fixed offset from the catalogue", () => {
    const place = cityPlace(searchCities(kz, "Алматы")[0]);
    expect(
      normalizeTime({ ...demoInput, ...place, date: "2020-01-01" }).civil
        .offset,
    ).toBe(360);
    expect(
      normalizeTime({ ...demoInput, ...place, date: "2025-01-01" }).civil
        .offset,
    ).toBe(300);
  });
  it("includes valid coordinates and timezones in every committed country shard", () => {
    const zones = new Set<string>();
    for (const file of readdirSync("public/locations").filter((f) =>
      f.endsWith(".json"),
    )) {
      const rows: CityRow[] = JSON.parse(
        readFileSync(`public/locations/${file}`, "utf8"),
      );
      for (const row of rows) {
        if (
          !row[1] ||
          Math.abs(row[3]) > 90 ||
          Math.abs(row[4]) > 180 ||
          !row[5]
        )
          throw new Error(`Invalid city ${row[0]}`);
        zones.add(row[5]);
      }
    }
    for (const zone of zones)
      expect(
        () => new Intl.DateTimeFormat("ru", { timeZone: zone }),
      ).not.toThrow();
  });
});
