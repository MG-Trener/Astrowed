import { describe, expect, it } from "vitest";
import { animals, branches } from "../domain/bazi/catalog";
import { palaceZodiac, zodiacPaths, type ZodiacSide } from "./palace-zodiac";

describe("Qi Men compass artwork (presentation only)", () => {
  it("keeps all 12 canonical branches and animals, with unique illustrations", () => {
    expect(palaceZodiac.map((animal) => animal.branch)).toEqual(branches);
    expect(palaceZodiac.map((animal) => animal.name)).toEqual(animals);
    expect(new Set(palaceZodiac.map((animal) => animal.id)).size).toBe(12);
    for (const animal of palaceZodiac) {
      expect(zodiacPaths[animal.id].length).toBeGreaterThan(0);
      for (const path of zodiacPaths[animal.id]) expect(path).toMatch(/^M/);
    }
  });

  it("maps branches to eight directional palaces, never to the center", () => {
    expect(palaceZodiac.map((animal) => animal.palace)).toEqual([1, 8, 8, 3, 4, 4, 9, 2, 2, 7, 6, 6]);
    expect(new Set(palaceZodiac.map((animal) => animal.palace)).size).toBe(8);
    expect(palaceZodiac.map((animal) => animal.bearing)).toEqual(Array.from({ length: 12 }, (_, i) => i * 30));
  });

  it("uses the south-up layout without reversing east and west", () => {
    const side = (name: ZodiacSide) => palaceZodiac.filter((animal) => animal.side === name).sort((a, b) => a.slot - b.slot).map((animal) => animal.branch);
    expect(side("top")).toEqual(["巳", "午", "未"]);
    expect(side("right")).toEqual(["申", "酉", "戌"]);
    expect(side("bottom")).toEqual(["丑", "子", "亥"]);
    expect(side("left")).toEqual(["辰", "卯", "寅"]);
  });

  it("reserves exactly three non-overlapping positions on each side", () => {
    expect(new Set(palaceZodiac.map((animal) => `${animal.side}-${animal.slot}`)).size).toBe(12);
    for (const side of ["top", "right", "bottom", "left"]) {
      expect(palaceZodiac.filter((animal) => animal.side === side).map((animal) => animal.slot).sort()).toEqual([0, 1, 2]);
    }
  });
});
