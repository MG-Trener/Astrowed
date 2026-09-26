import { describe, it, expect } from "vitest";
import {
  mountains,
  mountainAt,
  bearingBetween,
  normalizeBearing,
  boundaryDistance,
} from "../src/domain/feng-shui/compass";
describe("24-mountain earth plate", () => {
  it("has 24 unique mountains in 15-degree sectors, including north across zero", () => {
    expect(new Set(mountains.map((m) => m.han)).size).toBe(24);
    expect(mountainAt(359.9).han).toBe("子");
    expect(mountainAt(0).code).toBe("С-2");
    expect(mountainAt(7.499).code).toBe("С-2");
    expect(mountainAt(7.5).code).toBe("С-3");
    expect(mountainAt(337.5).han).toBe("壬");
    expect(mountainAt(352.5).han).toBe("子");
  });
  it("maps cardinal and diagonal directions to Later Heaven trigrams", () => {
    expect(
      [0, 45, 90, 135, 180, 225, 270, 315].map(
        (a) => mountainAt(a).direction.id,
      ),
    ).toEqual([1, 8, 3, 4, 9, 2, 7, 6]);
    for (const m of mountains)
      expect(mountainAt(m.angle + 180).angle).toBe(
        normalizeBearing(m.angle + 180),
      );
    expect(mountainAt(22.5).direction.id).toBe(8);
    expect(mountainAt(337.5).direction.id).toBe(1);
  });
  it("handles rotation, wraparound and closeness to sector boundaries", () => {
    expect(mountainAt(normalizeBearing(3 - 10)).code).toBe("С-2");
    expect(normalizeBearing(-720)).toBe(0);
    expect(boundaryDistance(7.5)).toBe(0);
    expect(boundaryDistance(0)).toBe(7.5);
    expect(boundaryDistance(352.6)).toBeCloseTo(0.1);
  });
});
describe("geographic facade bearings", () => {
  const origin = { lat: 0, lng: 0 };
  it("measures clockwise from north and rejects identical points", () => {
    expect(bearingBetween(origin, { lat: 1, lng: 0 })).toBeCloseTo(0);
    expect(bearingBetween(origin, { lat: 0, lng: 1 })).toBeCloseTo(90);
    expect(bearingBetween(origin, { lat: -1, lng: 0 })).toBeCloseTo(180);
    expect(bearingBetween(origin, { lat: 0, lng: -1 })).toBeCloseTo(270);
    expect(bearingBetween(origin, origin)).toBeNull();
    expect(
      bearingBetween({ lat: 0, lng: 179.9 }, { lat: 0, lng: -179.9 }),
    ).toBeCloseTo(90);
  });
});
