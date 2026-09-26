# Chinese monthly calendar

Routes: `/calendar/` in the main app and static Pages export. Main navigation links to the tool.

## Calculation policy

`src/domain/calendar/engine.ts` uses the pinned lunar-typescript 1.8.6 package already used by Ba Zi. Supported Gregorian dates: 1901–2099. All dates and solar-term times use the Chinese civil calendar (UTC+8), with midnight day boundaries. There is no browser-timezone, local-solar-time or natal-profile adjustment. The UI states this explicitly.

The lunar date (including negative/intercalary month numbers), day pillar and solar terms come from the library. Month/year pillars use exact solar-term boundaries; the astrological year changes at Li Chun. A transition day is split into before/after profiles at the computed term time. The month grid reports its first period and marks the transition; the day panel switches periods. Times are algorithmic estimates, not a claim of observational accuracy to the second.

- Twelve officers: `(dayBranch - exactMonthBranch + 12) % 12`.
- Twelve deities: the library's branch-offset formula, using the exact month branch for each period. Yellow/black path classification is shown separately from action lists.
- Yi/Ji: `getDayYi(2)` / `getDayJi(2)` for the selected period's month/day pillars. General restrictions such as 馀事勿取 appear in the restriction list even when stored under Yi by the source. Absence of a record is neutral, not favorable. A general 诸事不宜 restriction takes precedence in the activity filter.
- Clash: opposing branches, six apart, for month/year. The opposite animal is an informational day symbol, not a verdict for everyone with that birth-year animal.
- Three Sha: year/month trine groups map to three branches: Shen-Zi-Chen → Si-Wu-Wei; Si-You-Chou → Yin-Mao-Chen; Yin-Wu-Xu → Hai-Zi-Chou; Hai-Mao-Wei → Shen-You-Xu. Labels distinguish robbery, calamity and delay themes. This is not a prediction of real incidents.

The almanac is general. Personal date selection, hourly Qi Men, natal compatibility and combined proprietary scoring are not implemented or implied.

## Combined assessment (Astrowed v1)

`assessment.ts` evaluates 17 explicitly listed activities. It preserves raw Yi/Ji in a separate expandable section and supplies a reason trail for each result. Source links stay in code and this developer document; the user-facing calendar contains plain explanations and links only to the site's own articles and Ba Zi calculator. It does not claim universal correctness across schools or parity with Mingli's undisclosed priorities.

- A specific restriction (Ji, general prohibition, incompatible officer, year/month clash for a major start, relevant Sha delay or commercial wealthless marker) takes priority over support. Conflicting positive reasons remain visible.
- Caution without a specific restriction yields amber, even when Yi supports the activity. A positive record with no restriction/caution yields green. No applicable evidence stays neutral. Yellow path alone never creates positive evidence.
- All twelve officers have explicit activity mappings, including dismantling on Break and the bed/groundwork exceptions on Danger. We do not infer recommendations for unlisted activities.
- Year/month clashes affect the defined major-start set, not cleaning or routine obligations. Sha delay restricts travel, moving, home entry and property transactions; other Sha/major-start combinations give caution. This scope and priority are the site's conservative policy, not a universally agreed cancellation formula.
- Wealthless days use stem Lu branches `[寅,卯,巳,午,巳,午,申,酉,亥,子]` and the day's ten-day-cycle void. The derived pillars are 甲辰, 乙巳, 丙申, 丁亥, 戊戌, 己丑, 庚辰, 辛巳, 壬申, 癸亥. Only the defined commercial-start activities are restricted; taking up employment is not silently included.
- Four separation days precede the civil dates of equinoxes/solstices; four exhaustion days precede Li Chun/Xia/Qiu/Dong, all UTC+8. These and black-path background give caution for major starts. They do not suppress routine chores.
- Medical and legal timing is not part of the combined activity selector. A birth-year animal is not a personal assessment.

Rule references (formulas/associations, with original Russian explanation):

- https://www.bazichic.com/uploads/documents/bazichik20191227104900.pdf, pages 7 and 14–15 (clashes and officers)
- https://xkfsa.wordpress.com/2021/06/21/date-selection-danger-day/ (Danger exceptions)
- https://www.suanzhun.net/book/1985.html (classical text: Lu in void)
- https://ctext.org/wiki.pl?chapter=609842&if=gb&remap=gb (classical seasonal-day definitions)

No numerical luck score, probability or outcome prediction is computed. Unimplemented personal/hourly/Dong Gong layers are not silently represented as evaluated.

## Explanations and design

`catalog.ts` contains original Russian names and explanatory prose for every term in the library's Yi/Ji vocabulary (coverage tested), 12 officers, 12 deities and 24 solar terms. Activities have visible plus/minus labels and expandable explanations; color alone is never the only signal. The panel explains mixed/contradictory layers. Health, legal and financial labels are presented as cultural categories, not decisions to postpone care or ignore actual obligations.

The jade/gold layout reuses the project's original zodiac images and adds an original animated SVG lunar scene: textured sphere, drifting shadow, rotating orbits and light particles. This is decorative, not a calculated lunar phase. Motion pauses offscreen, in a hidden document, with the site's background pause control and for reduced-motion preferences. No competitor graphics, stylesheets, proprietary data tables or explanatory prose were copied. The grid remains seven columns on mobile with compact day cells; detail expands below and provides a return link. The selected activity highlights the month without hiding dates.

## Research and verification

Public competitor pages inspected in the in-app browser:

- https://www.mingli.ru/calendar
- https://www.mingli.ru/3-09-2026

Observed features: month/year selection, lunar day, day animal, 12 officers, month/year Sha and clashes, green/red action icons with labels, detailed day and hour descriptions. The implementation follows the monthly-calendar interaction idea with its own design and engine. Different almanac tables and schools can disagree with Mingli.

Specific comparison on 2026-09-27 (https://www.mingli.ru/27-09-2026): both show Wood Dragon, lunar day 17, officer 8 Danger and monthly Sha. Raw Yi supports marriage, travel and moving. The combined assessment now restricts these through the officer/Sha rules while preserving the contradictory Yi evidence. The wealthless marker is derived independently and restricts commercial starts. No individual-date override is used; this fixture is not evidence of complete Mingli parity.

Primary library documentation:

- https://6tail.cn/calendar/lunar.zhixing.html
- https://6tail.cn/calendar/lunar.tianshen.html
- https://6tail.cn/calendar/lunar.yiji.html (author explicitly notes Yi/Ji variation among sources)
- https://6tail.cn/calendar/lunar.jieqi.html

Independent astronomical fixture source:

- https://www.hko.gov.hk/en/gts/time/calendar/pdf/files/2026e.pdf

`tests/calendar.test.ts`: Gregorian leap dates, Monday-first alignment, invalid input/range limits, HKO 2026 lunar fixtures, intercalary month, observed September 2026 pillars/officers, exact month/year transition profiles, full translation coverage and filter restriction precedence. `tests/calendar-assessment.test.ts`: September 27 contradictions, the full 60-day wealthless cycle, seasonal-day boundaries, routine-work exceptions, retained positive evidence and reason/priority invariants over six months. Browser checks cover month submission, transition toggle, activity explanations and mobile layout. Standard validation: `npm test`, `npm run typecheck`, `npm run build:pages`, `npm run verify:pages`.
