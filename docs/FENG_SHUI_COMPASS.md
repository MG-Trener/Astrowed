# Feng Shui compass

`/feng-shui/compass/` is available in the main app and the static Pages export. The Feng Shui landing page and the library article about compass measurements link to it.

The tool uses Leaflet 1.9 and OpenStreetMap tiles. It needs no Google API key. Only visible map tiles are requested; browser caching and the normal Referer are retained. Map attribution is visible, tile failures show a retry action, and the country/city search uses the site's GeoNames catalog (with attribution), rather than an external geocoder. Cities can be selected with a keyboard. Buildings are selected on the map, or by exact coordinates; address geocoding and satellite imagery are not included.

Map configuration can be changed at build time with `NEXT_PUBLIC_COMPASS_TILE_URL` and `NEXT_PUBLIC_COMPASS_TILE_ATTRIBUTION` (HTML supplied by the deployment owner). Use a tile provider appropriate to traffic and its licence. Do not enable bulk prefetch or offline tile downloads.

## Geometry and display

- The earth plate has 24 half-open 15-degree sectors. Zi/N2 spans 352.5° through 7.5°. Eight Later Heaven trigrams use the existing palace catalog. The implementation is in `domain/feng-shui/compass.ts`.
- Reference for the mountain sequence and ranges: https://fengshuibazicentre.com/pdf/What%20is%20the%2024mountains.pdf . Leaflet API: https://leafletjs.com/reference.html . Tile policy: https://operations.osmfoundation.org/policies/tiles/ .
- The map's north points up. Selecting an exterior point computes the geographic initial bearing from the chosen centre. Coincident points and points less than a metre away are rejected. This is a local direction aid, not a cadastral survey.
- Manual north rotation is clockwise relative to the map. The ring reading is `normalize(map bearing − rotation)`; the sitting direction is 180° opposite. Magnetic declination is not automatically calculated, and the UI explicitly distinguishes map north and the rotated ring.
- Centre coordinates remain attached to the map during pan and zoom. The centre marker is draggable. Ring diameter is in screen pixels and adapts to narrow screens; it does not imply a real property boundary. Clicking a mountain selects its midpoint, while exact facade azimuths can be entered numerically or with a slider.
- The jade and gold dial is original SVG, with transparent centre, element colours and a highlighted direction. Export targets only `svg[data-compass-dial]`, preserves rotation and opacity, and downloads the dial alone (no map tiles).

## Validation

`tests/compass.test.ts` covers north wraparound, sector boundaries, the trigram sequence, opposite directions, rotation, boundary proximity and geographic bearings including the date line. Run `npm test`, `npm run build:pages` and `npm run verify:pages`.

Browser checks: city selection, building zoom, setting and dragging the centre, facade selection, numeric bearing, ring click/keyboard activation, rotation/reset, exact coordinates, SVG download, loaded tiles and a 390px mobile layout. Confirm attribution remains visible and that the downloaded SVG contains the full 600×600 dial rather than a map-provider icon.
