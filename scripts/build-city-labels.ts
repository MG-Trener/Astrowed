import { readFileSync, writeFileSync } from "node:fs";
const file = "src/data/city-catalog.json";
const catalog = JSON.parse(readFileSync(file, "utf8"));
// Commit labels/order so different Node/browser ICU versions hydrate identically.
const names = new Intl.DisplayNames(["ru"], { type: "region" });
catalog.countryLabels = catalog.countries
  .map((code: string) => ({ code, name: names.of(code) ?? code }))
  .sort((a: { name: string }, b: { name: string }) =>
    a.name.localeCompare(b.name, "ru"),
  );
writeFileSync(file, JSON.stringify(catalog, null, 2) + "\n");
