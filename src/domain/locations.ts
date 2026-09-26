import type { BirthInput } from "./bazi/types";

// GeoNames: id, name, region, latitude, longitude, IANA zone, population, aliases.
export type CityRow = [
  number,
  string,
  string,
  number,
  number,
  string,
  number,
  string,
];
export type Place = Pick<
  BirthInput,
  "city" | "latitude" | "longitude" | "timezone"
>;
export const normalizePlaceName = (name: string) =>
  name
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("ru")
    .replace(/ё/g, "е")
    .replace(/[\s’'‐‑–—-]+/g, " ")
    .trim();

export function searchCities(rows: CityRow[], query: string): CityRow[] {
  const q = normalizePlaceName(query);
  if (q.length < 2) return [];
  return rows
    .map((row) => {
      const names = `${row[1]}|${row[7]}`.split("|").map(normalizePlaceName);
      const rank = names.includes(q)
        ? 0
        : names.some((n) => n.startsWith(q))
          ? 1
          : names.some((n) => n.includes(q))
            ? 2
            : 3;
      return { row, rank };
    })
    .filter((item) => item.rank < 3)
    .sort((a, b) => a.rank - b.rank || b.row[6] - a.row[6])
    .slice(0, 12)
    .map((item) => item.row);
}

export function cityPlace(row: CityRow): Place {
  return {
    city: row[1],
    latitude: row[3],
    longitude: row[4],
    timezone: row[5],
  };
}

export function manualPlace(
  city: string,
  timezone: string,
  latitude: string,
  longitude: string,
): Place | null {
  if (!city.trim() || !timezone.trim() || !latitude.trim() || !longitude.trim())
    return null;
  const lat = Number(latitude),
    lon = Number(longitude);
  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    Math.abs(lat) > 90 ||
    Math.abs(lon) > 180
  )
    return null;
  try {
    new Intl.DateTimeFormat("ru", { timeZone: timezone.trim() });
  } catch {
    return null;
  }
  return {
    city: city.trim(),
    timezone: timezone.trim(),
    latitude: lat,
    longitude: lon,
  };
}
