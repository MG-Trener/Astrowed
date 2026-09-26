// Manual refresh, not a build step: one bounded OSM extract, served locally thereafter.
import { mkdirSync, writeFileSync } from "node:fs";
const endpoint = "https://overpass-api.de/api/interpreter";
const query =
  '[out:json][timeout:90];area["boundary"="administrative"]["name:ru"="Астана"]->.city;(way(area.city)(50.91,71.01,51.45,71.88)[highway][name];nwr(area.city)(50.91,71.01,51.45,71.88)["addr:street"]["addr:housenumber"];);out tags center;';
const response = await fetch(endpoint, {
  method: "POST",
  body: new URLSearchParams({ data: query }),
  headers: {
    "User-Agent": "Astrowed/1.0 (https://github.com/MG-Trener/Astrowed)",
  },
  signal: AbortSignal.timeout(100000),
});
if (!response.ok) throw new Error("OSM extract failed: " + response.status);
const data = await response.json();
if (data.remark || !data.elements?.length)
  throw new Error(data.remark || "Empty OSM extract");
const keys = [
  "name",
  "name:ru",
  "highway",
  "building",
  "addr:street",
  "addr:street:ru",
  "addr:housenumber",
  "addr:city",
  "addr:country",
];
const elements = data.elements.map(
  (p: {
    type: string;
    id: number;
    lat?: number;
    lon?: number;
    center?: unknown;
    tags: Record<string, string>;
  }) => ({
    type: p.type,
    id: p.id,
    lat: p.lat,
    lon: p.lon,
    center: p.center,
    tags: Object.fromEntries(
      keys.filter((k) => p.tags[k]).map((k) => [k, p.tags[k]]),
    ),
  }),
);
mkdirSync("public/locations/addresses", { recursive: true });
writeFileSync(
  "public/locations/addresses/astana.json",
  JSON.stringify({
    source: endpoint,
    license: "© OpenStreetMap contributors · ODbL 1.0",
    updatedAt: data.osm3s.timestamp_osm_base,
    elements,
  }),
);
console.log(`Saved ${elements.length} Astana streets and addresses.`);
