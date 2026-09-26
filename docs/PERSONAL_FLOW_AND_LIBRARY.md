# Personal flow and visual expansion — 26.09.2026

## Personal data flow

Removed UI imports of demoInput and the automatic 1990 date. New birth/event forms start with empty date, time and city. Successful Ba Zi calculation stores only the validated input in sessionStorage under astrowed-active-birth-v1; context shares the calculated chart across navigation. Refresh rebuilds it using the stored calculation policy. Corrupt/missing storage yields an empty state, never a demonstration. Storage failure retains in-memory use. Explicitly opened saved server charts become the active chart without rewriting the DB. /chart/current is public client state; the old /chart/demo address now uses the same personal/empty view.

Standalone luck, life years, symbolic stars, energies and reports use the active chart. Forms can resume its inputs. Qi Men/Gua show their own submitted results without replacing the active natal chart. Unknown time stays visibly blank in forms and is omitted from the natal hour pillar. The internal 12:00 anchor is used only after choosing unknown time.

## Interface

- Three discovery cards now draw animated SVG links for actual four pillars, element shares and twelve two-hour samples of a selected civil date in the chart city. The sample calculations apply mean solar correction. Day-cycle date can change independently of birth date. Invalid/DST-ambiguous samples display a question mark. These are diagrams, not generated factual charts.
- Qi Men and Gua forms appear first with compact two-column fields and collapsed help. Results replace the form until “change data” is selected. Regular forms fit 320×640; optional manual location/ju, expanded help, validation messages and full results can need scrolling.
- New transparent generated header/footer emblem. Rare jade, gold and violet meteors, staggered 31/43/53-second loops. Background pause, hidden tab, compact mode and reduced-motion are respected. Discovery diagrams have their own pause.
- Library: 13 introductory articles (previously 6), paragraph headings, sources, related reading and topic illustrations. Twelve new article illustrations and one logo; all 13 articles have distinct generated covers, including the existing four-pillars artwork. Shared bundled content powers Pages and supplements server CMS; published CMS records with matching slugs take precedence. No DB migration or content mutation.

## Validation

66 tests, including new session restoration, replacing a selected date, empty/corrupt storage and unknown-hour preservation. TypeScript, server build, Pages build and route/asset verification (41 HTML pages). Browser checks: native date/time entry, 1989 calculation, navigation to luck and PDF, refresh, Qi Men/Gua results, forms at 320×640, discovery diagrams and pause. Image prompts and saved paths: LIBRARY_IMAGERY_PROMPTS.md.

Calendar source references are attached to the relevant articles: Hong Kong Observatory for Gan-Zhi and solar terms, lunar documentation for implementation. Interpretive text remains an introductory traditional model, with expert-review status clearly visible.

