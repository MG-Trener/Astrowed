# City catalogue

Derived from [GeoNames cities500.zip, alternateNamesV2.zip and admin1CodesASCII.txt](https://download.geonames.org/export/dump/), downloaded 2026-09-26. Licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Attribution: GeoNames, https://www.geonames.org/.

Changes: JSON conversion, grouping by country, population ordering, removal of unused columns, Russian city/region names where available. Display names prefer a non-historical, non-colloquial Russian name marked preferred in GeoNames; otherwise a current Russian alternate name, then the primary source name. All supplied alternate names remain searchable, including old names. Each row: `[geonameId, name, region, latitude, longitude, timezone, population, pipeSeparatedAliases]`.

235,878 populated places in 246 countries/territories. Source coverage: population over 500 or administrative seats down to PPLA4; not every village or historical locality is included. Coordinates are representative settlement coordinates, not an exact birth address. Data is provided as is and may contain omissions/errors.

Rebuild: download the three files above into `artifacts/geonames`, run `python scripts/build-city-catalog.py`. The version in that script must be updated when refreshing. The static Pages build copies this directory automatically. Clients fetch only their chosen country's file; search text and birth data are not sent to GeoNames. No external API key is used.

Timezone identifiers are used with the runtime's historical IANA rules for the entered birth date; current UTC offsets are not stored. Historical locality/boundary changes and exact birth coordinates may need manual verification. Mean solar time includes longitude correction, not the equation of time. Latitude is retained for location identification and does not enter the current BaZi calculation.
