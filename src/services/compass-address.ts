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
  street?: string;
  house?: string;
};
const cache = new Map<string, AddressMatch[]>();
let astanaData: unknown;
const normalizeHouse = (value: string) =>
  value.toLocaleLowerCase().replace(/\s/g, "");

const letters: Record<string, string> = {
  ә: "а",
  ғ: "г",
  қ: "к",
  ң: "н",
  ө: "о",
  ұ: "у",
  ү: "у",
  і: "и",
  ё: "е",
};
const normalizeStreet = (value: string) =>
  value.toLowerCase().replace(/[әғқңөұүіё]/g, (c) => letters[c]);
function streetWords(value: string) {
  return normalizeStreet(value)
    .split(/[\s.,-]+/)
    .filter(
      (w) =>
        w &&
        ![
          "улица",
          "ул",
          "көшесі",
          "кошеси",
          "проспект",
          "пр",
          "даңгылы",
          "дангылы",
          "переулок",
          "пер",
          "тупик",
          "тұйық",
          "туйык",
        ].includes(w),
    );
}
function streetKind(value: string) {
  if (/переулок|тұйық|туйык|\bпер\./i.test(value)) return "lane";
  if (/проспект|даңғылы|дангылы/i.test(value)) return "avenue";
  if (/улица|көшесі|кошеси|\bул\./i.test(value)) return "street";
  return "";
}
export function streetMatches(name: string, query: string) {
  const kind = streetKind(query);
  if (kind && streetKind(name) && kind !== streetKind(name)) return false;
  const words = streetWords(name);
  return streetWords(query).every((q) =>
    words.some((w) => w.startsWith(q.replace(/а$/, ""))),
  );
}

export function osmAddressQuery(query: AddressQuery) {
  // Escape both the regex and the Overpass string: user text is never query syntax.
  const token =
    streetWords(query.street)
      .filter((w) => w.length >= 3)
      .at(-1) ?? "";
  if (!token) throw new Error("Уточните название улицы.");
  const pattern = token
    .replace(/а$/, "")
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/к/g, "[кқ]")
    .replace(/г/g, "[гғ]")
    .replace(/н/g, "[нң]")
    .replace(/о/g, "[оө]")
    .replace(/у/g, "[уұү]")
    .replace(/и/g, "[иі]")
    .replace(/а/g, "[аә]");
  const latRadius = 0.27;
  const lngRadius = Math.min(
    3,
    latRadius / Math.cos((query.center.lat * Math.PI) / 180),
  );
  const around = `(area.city)(${query.center.lat - latRadius},${query.center.lng - lngRadius},${query.center.lat + latRadius},${query.center.lng + lngRadius})`;
  const roads = `way${around}[highway][~"^name(:ru)?$"~${JSON.stringify(pattern)},i];`;
  const houses = query.house.trim()
    ? `nwr${around}["addr:street"]["addr:housenumber"=${JSON.stringify(query.house.trim())}];`
    : "";
  const city = JSON.stringify(query.city);
  return `[out:json][timeout:20];(area["boundary"="administrative"]["name"=${city}];area["boundary"="administrative"]["name:ru"=${city}];)->.city;(${roads}${houses});out tags center;`;
}

export function parseOsmAddresses(
  data: unknown,
  query: AddressQuery,
): AddressMatch[] {
  type Item = {
    type: string;
    id: number;
    lat?: number;
    lon?: number;
    center?: { lat: number; lon: number };
    tags?: Record<string, string>;
  };
  const payload = data as { elements?: Item[]; remark?: string };
  if (!Array.isArray(payload?.elements) || payload.remark)
    throw new Error("Поиск адресов недоступен.");
  const elements = payload.elements.filter(
    (p) => p && typeof p === "object" && p.tags && typeof p.tags === "object",
  );
  const roads = elements.filter((p) => p.tags?.highway && p.tags.name);
  const names = new Map<string, string>();
  for (const r of roads)
    for (const name of [r.tags!.name, r.tags!["name:ru"]].filter(Boolean))
      names.set(normalizeStreet(name), r.tags!["name:ru"] || r.tags!.name);
  const found: AddressMatch[] = [];
  for (const item of query.house.trim()
    ? elements
        .filter((p) => p.tags?.["addr:housenumber"])
        .sort((a, b) => Number(!!b.tags?.building) - Number(!!a.tags?.building))
    : roads) {
    const t = item.tags!;
    const raw = query.house.trim() ? t["addr:street"] : t.name;
    const street =
      t["addr:street:ru"] || names.get(normalizeStreet(raw || "")) || raw;
    if (!street || !streetMatches(street, query.street)) continue;
    const house = t["addr:housenumber"] || "";
    if (
      query.house.trim() &&
      normalizeHouse(house) !== normalizeHouse(query.house)
    )
      continue;
    const point = item.center || item;
    const center = { lat: point.lat!, lng: point.lon! };
    if (
      !Number.isFinite(center.lat) ||
      !Number.isFinite(center.lng) ||
      distanceBetween(query.center, center) > 30000
    )
      continue;
    const city = t["addr:city"];
    if (
      t["addr:country"] &&
      t["addr:country"].toUpperCase() !== query.country.toUpperCase()
    )
      continue;
    if (city && normalizeStreet(city) !== normalizeStreet(query.city)) continue;
    const label = `${street}${house ? `, ${house}` : ""}`;
    if (
      found.some(
        (p) =>
          p.label === label &&
          (!house || distanceBetween(p.center, center) < 100),
      )
    )
      continue;
    found.push({
      id: `${item.type}-${item.id}`,
      center,
      label,
      detail: query.city,
      street,
      house,
      zoom: house ? 18 : 15,
    });
  }
  // A street precedes a namesake lane unless the user explicitly asks for the lane.
  return found
    .sort(
      (a, b) =>
        Number(streetKind(a.street!) === "lane") -
          Number(streetKind(b.street!) === "lane") ||
        distanceBetween(query.center, a.center) -
          distanceBetween(query.center, b.center),
    )
    .slice(0, 8);
}

export async function searchAddress(query: AddressQuery, signal: AbortSignal) {
  const url = JSON.stringify(query);
  const cached = cache.get(url);
  if (cached) return cached;
  if (query.country === "KZ" && query.city === "Астана") {
    if (!astanaData) {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/locations/addresses/astana.json`,
        { signal },
      );
      if (!response.ok) throw new Error("Адресный справочник недоступен.");
      astanaData = await response.json();
    }
    return parseOsmAddresses(astanaData, query);
  }
  const response = await fetch(
    process.env.NEXT_PUBLIC_COMPASS_OSM_URL ||
      "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
    {
      method: "POST",
      body: new URLSearchParams({ data: osmAddressQuery(query) }),
      signal,
      credentials: "omit",
    },
  );
  if (!response.ok)
    throw new Error("Поиск адресов временно недоступен. Попробуйте ещё раз.");
  const matches = parseOsmAddresses(await response.json(), query);
  if (cache.size >= 50) cache.delete(cache.keys().next().value!);
  cache.set(url, matches);
  return matches;
}
