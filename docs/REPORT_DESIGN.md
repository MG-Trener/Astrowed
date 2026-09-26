# PDF design

Reports use the site's original artwork and a shared jade, brass and ivory palette. The cover image uses `object-fit: contain`; it is never cropped. Body pages keep a light background for legibility and print economy.

- Cover: complete observatory image, client details and Julia Gavrilycheva's mark.
- Contents: clickable chapter links with consecutive section numbers, followed by a short reading guide.
- Chapters: illustrated headings, readable pillars and tables, element artwork alongside the distribution chart, a direction diagram and the nine-palace board.
- Reading: intentional thematic breaks; the professional version separates introductory observations, resources and relationships over three parts. Consultant conclusions retain editable text and draft status.
- Qi Men: one A4 sheet, illustrated heading, all nine palaces and directions, methodology and expert mark. The browser embeds artwork into the SVG before PDF export so downloaded files remain self-contained.

`report-artwork-files.ts` declares the assets used by offline/server rendering. `assets/report-artwork.ts` supplies the same artwork to the browser. No customer data is sent to an external rendering service.

Validation: `npx tsx scripts/render-report-samples.ts` creates brief, full, professional and Qi Men samples in `output/pdf`. Review rendered pages after layout changes, including table continuations and the cover. The representative samples have 6, 13, 19 and 1 pages respectively; page counts can vary with the input and consultant text. `npm test` covers report content, escaping and the nine-palace data; `npm run build:pages` and `npm run verify:pages` cover static deployment.
