# Compasses on a map

`/compasses/` is the main tool route in both the app and the static Pages export. `/feng-shui/compass/` remains compatible. Navigation, the Feng Shui landing page and the library article link to the new section.

## Map and assets

MapLibre GL renders an OpenFreeMap vector style without a Google API key. Name labels prefer `name:ru`, then the local name, then Latin. House numbers and road references retain their original expressions. Russian labels therefore depend on coverage in OpenStreetMap data. Attribution stays visible. Country/city search uses the site's GeoNames catalog; buildings can be selected on the map or by exact coordinates. Address geocoding and satellite imagery are not included.

The demo centres on Astana Botanical Garden (51.106, 71.416). Geolocation is requested only after pressing the location button; denial, timeout and unavailable-position states offer manual selection. Later responses are ignored after a manual location change or unmount. Geolocation requires browser permission and a secure context (HTTPS or localhost).

`NEXT_PUBLIC_COMPASS_STYLE_URL` can override the MapLibre style URL at build time. Use a provider suitable for deployment traffic and its licence. No bulk map prefetching is enabled.

MapLibre 6's module worker imports a sibling shared module. `scripts/sync-map-assets.ts` copies both installed modules and their licence into each public directory before dev/build. These generated copies are ignored by Git. `setWorkerUrl` respects `NEXT_PUBLIC_BASE_PATH`, and `verify:pages` checks the exported worker assets.

## Interactive modes

- **24 mountains:** half-open 15-degree sectors; Zi/N2 spans 352.5 through 7.5 degrees. Shows facade, opposite sitting direction and proximity to boundaries.
- **Bagua:** eight Later Heaven trigrams, elements and traditional themes from the existing palace catalog.
- **Personal Gua:** the selected Gua number changes the eight Ba Zhai direction qualities and explanation.
- **Trip:** two draggable points, initial geographic bearing and great-circle distance. The connector is a straight line on the flat map, not a road route. Dragging the azimuth handle clears the destination for a free direction.

The four mode selectors remain in one row, scrolling horizontally on narrow screens. The description updates with direction, mode, Gua and selected points.

The gold/jade SVG has no broad background fill. Its centre marker and facade handle are draggable. The handle also supports arrow keys (one degree, or ten with Shift). Clicking a sector selects its midpoint. Inputs and sliders provide exact adjustment. The dial diameter is limited by both map width and height; screen size does not imply a property boundary.

The map can rotate while the dial stays geographically aligned. The north action resets map rotation; the toolbar north action also resets manual ring correction. Geographic bearing minus manual ring correction determines the reading. Magnetic declination is not calculated automatically. Coincident points and locations less than a metre apart are rejected.

The fullscreen workspace fills the browser viewport with the map, mode selectors and a scrollable panel on the right. The panel can be hidden. On phones it overlays the right side of the map. The return button or Escape restores the normal site layout without remounting the map or resetting settings. Body scroll is restored and keyboard focus stays within the expanded workspace while open.

SVG export targets `svg[data-compass-dial]`, preserving the current orientation and opacity; it downloads only the transparent dial, not map tiles.

## References and scope

MapLibre documentation: https://maplibre.org/maplibre-gl-js/docs/
OpenFreeMap: https://openfreemap.org/quick_start/
Mountain ranges: https://fengshuibazicentre.com/pdf/What%20is%20the%2024mountains.pdf

The public Mingli 24 Mountains, Directions and Navigator guide were reviewed in the browser: https://www.mingli.ru/about/item/How_to_Use_Navigator/ . This implementation uses original UI/SVG and existing project catalogs. It does not reproduce paid Qi Men, annual/monthly stars or multi-point travel forecasting layers.

## Validation

`tests/compass.test.ts` covers boundaries, trigrams, opposite directions, geographic bearings, rotated pointer geometry, great-circle distance/date-line wraparound and Russian label conversion without source mutation. Run `npm test`, `npm run typecheck`, `npm run build:pages` and `npm run verify:pages`.

Browser checks include the demo map, four modes, live explanation, azimuth keyboard/drag, north reset, destination selection, SVG export, single-row mobile selectors and fullscreen entry/exit with retained settings. Successful geolocation requires an actual permission decision and location provider on the user's device.
