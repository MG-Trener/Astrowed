import { Solar, SolarUtil, LunarUtil } from "lunar-typescript";
import { animals, branches } from "../bazi/catalog";
import { activities, deityNames, officers, solarTerms } from "./catalog";

export const MIN_YEAR = 1901,
  MAX_YEAR = 2099;
export type CalendarFlag = {
  id: string;
  name: string;
  meaning: string;
  tone: "good" | "bad" | "neutral";
  shaKind?: number;
};
export type DayProfile = {
  dayPillar?: string;
  from: string;
  until: string;
  monthPillar: string;
  yearPillar: string;
  officer: number;
  deity: string;
  deityGood: boolean;
  good: string[];
  bad: string[];
  flags: CalendarFlag[];
};
export type CalendarDay = {
  date: string;
  day: number;
  weekday: number;
  pillar: string;
  animal: number;
  lunarDay: number;
  lunarMonth: number;
  lunarYear: number;
  term: null | {
    han: string;
    name: string;
    time: string;
    changesMonth: boolean;
  };
  profiles: DayProfile[];
};
const mod = (n: number, m: number) => ((n % m) + m) % m;
const two = (n: number) => String(n).padStart(2, "0");
const shas = [
  [5, 6, 7],
  [2, 3, 4],
  [11, 0, 1],
  [8, 9, 10],
];
const shaNames = ["Ша ограбления", "Ша несчастья", "Ша задержек"];
const shaMeaning = [
  "Традиционная тема сохранности ресурсов и внимательного обращения с вещами.",
  "Традиционная тема осторожности и проверки обстоятельств.",
  "Традиционная тема задержек и препятствий; также называется Ша года или Ша месяца.",
];

export function calendarProfile(
  solar: Solar,
  from: string,
  until: string,
  seasonSolar: Solar = solar,
): DayProfile {
  const lunar = solar.getLunar(),
    day = lunar.getDayZhiIndex();
  const season = seasonSolar.getLunar();
  const month = season.getMonthZhiIndexExact(),
    year = season.getYearZhiIndexExact();
  const officer = mod(day - month, 12);
  const deity =
    LunarUtil.TIAN_SHEN[
      ((day + LunarUtil.ZHI_TIAN_SHEN_OFFSET[branches[month]]) % 12) + 1
    ];
  const deityGood = LunarUtil.TIAN_SHEN_TYPE[deity] === "黄道";
  const flags: CalendarFlag[] = [
    {
      id: "deity",
      name: `${deityNames[deity]} · ${deity}`,
      tone: deityGood ? "good" : "bad",
      meaning: `${deityGood ? "Жёлтый путь (黄道) — поддерживающий" : "Чёрный путь (黑道) — ограничивающий"} признак в цикле двенадцати дежурных духов. Это отдельный слой альманаха, а не общая оценка всех дел дня.`,
    },
  ];
  for (const [scope, index] of [
    ["месяца", month],
    ["года", year],
  ] as const) {
    if (mod(day - index, 12) === 6)
      flags.push({
        id: `clash-${scope}`,
        name: `Столкновение дня и ${scope}`,
        tone: "bad",
        meaning: `Ветвь дня ${branches[day]} (${animals[day]}) противоположна ветви ${scope} ${branches[index]} (${animals[index]}). Традиционный признак напряжения при выборе даты крупных начинаний.`,
      });
    const sha = shas[index % 4].indexOf(day);
    if (sha !== -1)
      flags.push({
        id: `sha-${scope}`,
        name: `${shaNames[sha]} ${scope}`,
        shaKind: sha,
        tone: "bad",
        meaning: `${shaMeaning[sha]} Признак получен из группы трёх Ша для ветви ${branches[index]} (${animals[index]}) ${scope}. Это символическое правило, не предсказание происшествия.`,
      });
  }
  // The stem's Lu branch falling in this ten-day cycle's void is Wu Lu.
  // This formula yields the traditional ten pillars, without date overrides.
  const luBranch = [2, 3, 5, 6, 5, 6, 8, 9, 11, 0][lunar.getDayGanIndex()];
  if (lunar.getDayXunKong().includes(branches[luBranch]))
    flags.push({
      id: "wealthless",
      name: "День без богатства · 十恶大败",
      tone: "bad",
      meaning: `Для столпа ${lunar.getDayInGanZhi()} ветвь Лу ${branches[luBranch]} попадает в пустоту декады ${lunar.getDayXunKong()}. В выборе дат это ограничение для начала коммерческих дел, а не прогноз дохода или характеристика человека.`,
    });
  const nextTerm = solar.next(1).getLunar().getCurrentJieQi();
  if (nextTerm) {
    const han = nextTerm.getName();
    const separation = ["春分", "夏至", "秋分", "冬至"].includes(han);
    const exhaustion = ["立春", "立夏", "立秋", "立冬"].includes(han);
    if (separation || exhaustion)
      flags.push({
        id: separation ? "separation" : "exhaustion",
        name: separation ? "День-разделитель · 四离" : "День истощения · 四绝",
        tone: "bad",
        meaning: `Календарный день перед сезоном «${solarTerms[han]}» по UTC+8. Это отдельный сезонный признак осторожности для крупных начинаний; он не запрещает обычные дела.`,
      });
  }
  flags.push({
    id: "opposite",
    name: `Противоположный знак: ${animals[(day + 6) % 12]}`,
    tone: "neutral",
    meaning: `Шестая противоположная ветвь — ${branches[(day + 6) % 12]}. В персональном выборе дат проверяют всю карту Ба Цзы; один знак года рождения не делает день плохим для человека.`,
  });
  return {
    dayPillar: lunar.getDayInGanZhi(),
    from,
    until,
    monthPillar: season.getMonthInGanZhiExact(),
    yearPillar: season.getYearInGanZhiExact(),
    officer,
    deity,
    deityGood,
    good: LunarUtil.getDayYi(
      season.getMonthInGanZhiExact(),
      lunar.getDayInGanZhi(),
    ).filter((k) => k !== "无"),
    bad: LunarUtil.getDayJi(
      season.getMonthInGanZhiExact(),
      lunar.getDayInGanZhi(),
    ).filter((k) => k !== "无"),
    flags,
  };
}
export function calculateCalendarDay(
  year: number,
  month: number,
  day: number,
): CalendarDay {
  if (
    !Number.isInteger(year) ||
    year < MIN_YEAR ||
    year > MAX_YEAR ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12 ||
    !Number.isInteger(day) ||
    day < 1 ||
    day > SolarUtil.getDaysOfMonth(year, month)
  )
    throw new Error("Укажите существующую дату 1901–2099 годов.");
  const start = Solar.fromYmdHms(year, month, day, 0, 0, 0),
    lunar = start.getLunar();
  const termInfo = lunar.getCurrentJieQi();
  const term = termInfo
    ? {
        han: termInfo.getName(),
        name: solarTerms[termInfo.getName()] ?? termInfo.getName(),
        time: termInfo.getSolar().toYmdHms().slice(11),
        changesMonth: termInfo.isJie(),
      }
    : null;
  const first = calendarProfile(start, "00:00:00", "24:00:00");
  const last = calendarProfile(
    Solar.fromYmdHms(year, month, day, 23, 59, 59),
    "00:00:00",
    "24:00:00",
  );
  const profiles = [first];
  if (
    term?.changesMonth &&
    (first.monthPillar !== last.monthPillar ||
      first.yearPillar !== last.yearPillar)
  ) {
    first.until = term.time;
    last.from = term.time;
    profiles.push(last);
  }
  return {
    date: `${year}-${two(month)}-${two(day)}`,
    day,
    weekday: (start.getWeek() + 6) % 7,
    pillar: lunar.getDayInGanZhi(),
    animal: lunar.getDayZhiIndex(),
    lunarDay: lunar.getDay(),
    lunarMonth: lunar.getMonth(),
    lunarYear: lunar.getYear(),
    term,
    profiles,
  };
}
export function calculateCalendarMonth(year: number, month: number) {
  // Validate before calling the library's month-length helper.
  calculateCalendarDay(year, month, 1);
  return Array.from({ length: SolarUtil.getDaysOfMonth(year, month) }, (_, i) =>
    calculateCalendarDay(year, month, i + 1),
  );
}
export function activityState(
  profile: DayProfile,
  activity: string,
): "good" | "bad" | "neutral" {
  // General restrictions remain visible even when a specific action appears in 宜.
  if (
    profile.bad.includes(activity) ||
    profile.bad.includes("诸事不宜") ||
    profile.good.includes("诸事不宜")
  )
    return "bad";
  if (profile.good.includes(activity)) return "good";
  if (profile.good.includes("馀事勿取") || profile.bad.includes("馀事勿取"))
    return "bad";
  return "neutral";
}
export function activityDescription(han: string) {
  return (
    activities[han] ?? {
      han,
      name: `Термин ${han}`,
      meaning: "Перевод этого редкого термина пока не добавлен.",
      category: "general",
    }
  );
}
export function officerDescription(index: number) {
  return officers[index];
}
