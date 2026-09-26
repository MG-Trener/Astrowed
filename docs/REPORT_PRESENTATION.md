# PDF presentation and consultation links

All report levels use `src/services/report-template.ts` both in the browser print preview and on the PDF API. Inline SVG graphics in `report-graphics.ts` require no network requests: the five-element chart uses the actual distribution, and the compass shows all eight directions with south at the top.

The cover uses `object-fit: contain` and a non-shrinking image area so the entire observatory illustration remains visible on A4. The cover and consultation card identify Юлия Гаврилычева as «Эксперт-астролог».

`src/data/consultation.ts` is the shared source for the WhatsApp and Telegram links used on the website and in PDF reports. Both include a UTF-8 encoded greeting requesting a consultation. These links prepare a draft; the visitor sends it themselves. Telegram's phone-number draft format follows its [official deep-link documentation](https://core.telegram.org/api/links#phone-number-links).

Generate offline examples with `npx tsx scripts/render-report-samples.ts`. The three report levels are written to `output/pdf/` (ignored by Git). Review rendered PDF pages after layout changes.
