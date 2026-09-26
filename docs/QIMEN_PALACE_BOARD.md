# Qi Men · interactive palace board

The calculation engine and its contracts are unchanged. `PalaceBoard` now lives in
`src/components/palace-board.tsx`; `qimen-view.tsx` re-exports it for existing report
imports. Both the server app and the GitHub Pages app use the same component.

## Display

- Luo Shu remains 4–9–2 / 3–5–7 / 8–1–6, south up and east left.
- Twelve individually generated jade-and-brass animal images sit outside the nine calculation cells.
  They represent fixed directional branches, not calculated omens, extra palaces,
  or a substitute for the eight spirits. Their data and paths are in
  `palace-zodiac.ts`; static local artwork is mapped in `src/assets/zodiac-artwork.ts`.
  Original SVG line illustrations remain for printing and image-load fallback.
  Final generation prompts and asset paths are in `QIMEN_ZODIAC_PROMPTS.md`.
- All eight compass directions remain visible around the frame, including when
  animals are hidden. South is above, north below, east left and west right.
  Narrow layouts use abbreviations; accessible names and tooltips spell out the
  directions, and tooltips include geographical bearings.
- Selecting a palace or an animal updates the same detail panel. The eight
  external cells read stems, stars, doors, spirits, duty flags and hosted stems
  directly from `QimenChart`. The center has no invented door or spirit; its
  hosting palace is found from the actual `hosted` result.
- Five layer filters and an optional animal frame. At narrow widths, short
  Chinese symbols keep all nine cells in place; full names remain in the detail
  panel and accessible button labels.
- CSS is module-scoped. No global styles, background animation or storage changes.
- Printing restores all calculation layers even when the screen is filtered.
  Reduced-motion preferences disable the small hover transitions.

## Verification

`palace-zodiac.test.ts` checks the canonical branch/animal names, all twelve SVGs,
compass bearings, palace mapping, and the south-up frame order. Run `npm test`,
`npm run typecheck`, `npm run build:pages` and `npm run verify:pages`.

Visual checks: desktop, 390px and 320px; nine cells stay in a 3×3 grid and there
is no horizontal page overflow. Check all five filters, animal visibility,
selection by keyboard and pointer, center hosting and the print view.
