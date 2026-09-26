import { distanceBetween, type Coordinates } from "../domain/feng-shui/compass";

export type AddressQuery = {
  city: string;
  country: string;
  center: Coordinates;
  street: string;
  house: string;
};
export type AddressMatch = {
  id: string;
  center: Coordinates;
  label: string;
  detail: string;
  zoom: number;
};
const cache = new Map<string, AddressMatch[]>();
const normalizeHouse = (value: string) =>
  value.toLocaleLowerCase().replace(/\s/g, "");

export function addressSearchUrl(query: AddressQuery) {
  const url = new URL(
    process.env.NEXT_PUBLIC_COMPASS_GEOCODER_URL ||
      "https://photon.komoot.io/structured",
  );
  url.search = new URLSearchParams({
    city: query.city,
    countrycode: query.country,
    street: query.street.trim(),
    ...(query.house.trim() ? { housenumber: query.house.trim() } : {}),
    lat: String(query.center.lat),
    lon: String(query.center.lng),
    limit: "8",
    lang: "default",
  }).toString();
  return url.toString();
}

// Validate provider data before moving the map. A street-level fallback is
// never presented as a found building when a house number was requested.
export function parseAddressResults(
  data: unknown,
  query: AddressQuery,
): AddressMatch[] {
  const features = (data as { features?: unknown[] } | null)?.features;
  if (!Array.isArray(features))
    throw new Error("Некорректный ответ поиска адресов.");
  const found: AddressMatch[] = [];
  for (const feature of features) {
    if (!feature || typeof feature !== "object") continue;
    const { properties: p, geometry: g } = feature as {
      properties?: Record<string, unknown>;
      geometry?: { type?: string; coordinates?: unknown[] };
    };
    if (!p || g?.type !== "Point" || !Array.isArray(g.coordinates)) continue;
    const [lng, lat] = g.coordinates;
    if (
      typeof lat !== "number" ||
      typeof lng !== "number" ||
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      Math.abs(lat) > 85 ||
      Math.abs(lng) > 180
    )
      continue;
    const center = { lat, lng };
    if (
      String(p.countrycode).toUpperCase() !== query.country.toUpperCase() ||
      distanceBetween(query.center, center) > 60000
    )
      continue;
    const house = typeof p.housenumber === "string" ? p.housenumber : "";
    if (query.house.trim()) {
      if (normalizeHouse(house) !== normalizeHouse(query.house)) continue;
    } else if (p.type !== "street") continue;
    const street =
      typeof p.street === "string"
        ? p.street
        : typeof p.name === "string"
          ? p.name
          : "";
    if (!street) continue;
    const label = `${street}${house ? `, ${house}` : ""}`;
    const detail = [
      ...new Set(
        [p.city, p.district, p.locality].filter(
          (v): v is string => typeof v === "string" && !!v,
        ),
      ),
    ].join(" · ");
    const id = `${p.osm_type}-${p.osm_id}-${lat}-${lng}`;
    if (!found.some((item) => item.id === id))
      found.push({ id, center, label, detail, zoom: house ? 18 : 15 });
  }
  return found.sort(
    (a, b) =>
      distanceBetween(query.center, a.center) -
      distanceBetween(query.center, b.center),
  );
}

export async function searchAddress(query: AddressQuery, signal: AbortSignal) {
  const url = addressSearchUrl(query);
  const cached = cache.get(url);
  if (cached) return cached;
  const response = await fetch(url, { signal, credentials: "omit" });
  if (!response.ok)
    throw new Error("Поиск адресов временно недоступен. Попробуйте ещё раз.");
  const matches = parseAddressResults(await response.json(), query);
  if (cache.size >= 50) cache.delete(cache.keys().next().value!);
  cache.set(url, matches);
  return matches;
}
