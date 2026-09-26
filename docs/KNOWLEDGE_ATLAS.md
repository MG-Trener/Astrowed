# Knowledge atlas audit and replacement

## Observed problems

Clicking the old Fire SVG node on the local graph left Wood selected. The parent SVG captured the pointer on every pointerdown, redirecting the click away from the child node while also treating all gestures as dragging. Touch scrolling was disabled over the entire diagram. Pan had no bounds and labels became crowded as the collection grew. The server loaded only six CMS articles while Pages had thirteen bundled articles. Edges covered only the element generation cycle, leaving the expanded topics disconnected, and relation text was ignored.

## Resulting behaviour

The atlas is a reading navigator: select a concept, read explanations of its immediate relationships, follow a related concept or open its full article. Stable HTML buttons replace pan/zoom and pointer capture. Search, previous-topic history, shareable topic hashes, keyboard navigation and a native mobile selector support all thirteen bundled topics. Related-topic selection brings the updated heading into view and moves focus to it. Three optional ordered reading routes cover the first chart, time rules and five elements; following a connection off-route keeps the route visible without pretending the article was read.

Shared content describes study links separately from directional generation/control. Published CMS articles override their corresponding bundled entries, preserving editorial content. Stored UUID edges are resolved to article slugs; unavailable endpoints, self-links and duplicates are omitted. Custom relations remain editorial links rather than being relabelled as generation. Both server and Pages use the same presentation and built-in graph, and CMS failure retains the bundled atlas. No database writes or migration.

During browser QA, the existing galaxy SVG also produced a hydration warning due to platform differences in the final decimal places of trigonometric coordinates. Galaxy path and dust coordinates now use three decimal places; a fresh server-page load produced no console errors.

## Validation

- 71 tests, including five atlas cases: every article connected, UUID mapping/deduplication, unpublished endpoints excluded, incoming/outgoing relation directions, custom links and reading-route endpoints.
- TypeScript, server and Pages production builds, 41-page export/link/asset verification.
- Browser: reproduced old failed pointer selection; verified new selection, search/no results, keyboard Enter, previous topic, route advancement, off-route navigation, article opening/back with the selected hash, server 13-topic catalogue and 320×640 mobile selection without overflow.
