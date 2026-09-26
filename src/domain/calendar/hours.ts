import { DateTime } from "luxon";
import { Solar, SolarUtil, LunarUtil } from "lunar-typescript";
import { branches, stems } from "../bazi/catalog";
import { deityNames, solarTerms } from "./catalog";
import {
  calendarProfile,
  MIN_YEAR,
  MAX_YEAR,
  type CalendarDay,
  type DayProfile,
} from "./engine";
import {
  assessActivity,
  type AssessmentReason,
  type AssessmentTone,
} from "./assessment";

export type CalendarPlace = {
  city: string;
  timezone: string;
  longitude: number;
};
export type ClockOptions = CalendarPlace & {
  timeMode: "civil" | "mean-solar";
  dayBoundary: "midnight" | "zi";
};
export const defaultClock: ClockOptions = {
  city: "Астана",
  timezone: "Asia/Almaty",
  longitude: 71.4491,
  timeMode: "civil",
  dayBoundary: "midnight",
};
export type HourWindow = {
  id: string;
  start: number;
  end: number;
  from: string;
  until: string;
  offset: string;
  endOffset: string;
  animal: number;
  pillar: string;
  dayPillar: string;
  calendarDate: string;
  profile: DayProfile;
  good: string[];
  bad: string[];
  deity: string;
  deityGood: boolean;
  clash: boolean;
  empty: boolean;
};
const solarAt = (d: DateTime) =>
  Solar.fromYmdHms(d.year, d.month, d.day, d.hour, d.minute, d.second);
const basisAt = (ms: number, options: ClockOptions) =>
  options.timeMode === "mean-solar"
    ? DateTime.fromMillis(ms, { zone: "UTC" }).plus({
        minutes: options.longitude * 4,
      })
    : DateTime.fromMillis(ms, { zone: options.timezone });
const effectiveDate = (clock: DateTime, options: ClockOptions) =>
  options.dayBoundary === "zi" && clock.hour === 23
    ? clock.plus({ days: 1 })
    : clock;

function bounds(date: string, options: ClockOptions) {
  const start = DateTime.fromISO(date, { zone: options.timezone }).startOf(
    "day",
  );
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !start.isValid ||
    start.toISODate() !== date ||
    start.year < MIN_YEAR ||
    start.year > MAX_YEAR ||
    !Number.isFinite(options.longitude) ||
    Math.abs(options.longitude) > 180
  )
    throw new Error("Проверьте дату и город. Доступны даты 1901–2099 годов.");
  return { start, end: start.plus({ days: 1 }).startOf("day") };
}

// Solar terms are absolute instants in the library's UTC+8 convention.
function termInstants(start: DateTime, end: DateTime) {
  const found = new Map<
    number,
    { han: string; ms: number; changesMonth: boolean }
  >();
  for (const year of new Set([start.year, end.year])) {
    const table = Solar.fromYmd(year, 6, 1).getLunar().getJieQiTable();
    for (const solar of Object.values(table)) {
      const ms = DateTime.fromSQL(solar.toYmdHms(), {
        zone: "UTC+8",
      }).toMillis();
      if (
        ms >= start.toMillis() - 172800000 &&
        ms <= end.toMillis() + 172800000
      ) {
        const term = solar.getLunar().getCurrentJieQi();
        if (term)
          found.set(ms, {
            han: term.getName(),
            ms,
            changesMonth: term.isJie(),
          });
      }
    }
  }
  return [...found.values()].sort((a, b) => a.ms - b.ms);
}

function localProfile(
  ms: number,
  options: ClockOptions,
  terms: ReturnType<typeof termInstants>,
) {
  const clock = basisAt(ms, options),
    effective = effectiveDate(clock, options);
  const lunar = solarAt(
    effective.set({ hour: 12, minute: 0, second: 0 }),
  ).getLunar();
  const profile = calendarProfile(
    solarAt(effective.set({ hour: 12, minute: 0, second: 0 })),
    "",
    "",
    solarAt(DateTime.fromMillis(ms, { zone: "UTC+8" })),
  );
  // Seasonal eve markers follow the selected local/solar date, not a UTC+8 eve.
  profile.flags = profile.flags.filter(
    (f) => !["separation", "exhaustion"].includes(f.id),
  );
  for (const term of terms) {
    if (
      basisAt(term.ms, options).toISODate() !==
      effective.plus({ days: 1 }).toISODate()
    )
      continue;
    const separation = ["春分", "夏至", "秋分", "冬至"].includes(term.han);
    const exhaustion = ["立春", "立夏", "立秋", "立冬"].includes(term.han);
    if (separation || exhaustion)
      profile.flags.push({
        id: separation ? "separation" : "exhaustion",
        name: separation ? "День-разделитель · 四离" : "День истощения · 四绝",
        tone: "bad",
        meaning: `День перед сезоном «${solarTerms[term.han]}» по выбранному местному времени. Дополнительная оговорка для крупных начинаний.`,
      });
  }
  const animal = Math.floor((clock.hour + 1) / 2) % 12;
  const stem = (lunar.getDayGanIndex() * 2 + animal) % 10;
  const pillar = stems[stem] + branches[animal];
  const deity =
    LunarUtil.TIAN_SHEN[
      ((animal + LunarUtil.ZHI_TIAN_SHEN_OFFSET[lunar.getDayZhi()]) % 12) + 1
    ];
  return {
    profile,
    animal,
    pillar,
    dayPillar: lunar.getDayInGanZhi(),
    calendarDate: effective.toISODate()!,
    good: LunarUtil.getTimeYi(lunar.getDayInGanZhi(), pillar).filter(
      (x) => x !== "无",
    ),
    bad: LunarUtil.getTimeJi(lunar.getDayInGanZhi(), pillar).filter(
      (x) => x !== "无",
    ),
    deity,
    deityGood: LunarUtil.TIAN_SHEN_TYPE[deity] === "黄道",
    clash: (animal - lunar.getDayZhiIndex() + 12) % 12 === 6,
    empty: lunar.getDayXunKong().includes(branches[animal]),
  };
}

export function calculateHourWindows(
  date: string,
  options: ClockOptions,
): HourWindow[] {
  const { start, end } = bounds(date, options),
    lo = start.toMillis(),
    hi = end.toMillis();
  const points = new Set<number>([lo, hi]);
  const add = (ms: number) => {
    const second = Math.ceil(ms / 1000) * 1000;
    if (second > lo && second < hi) points.add(second);
  };
  const terms = termInstants(start, end);
  for (const term of terms) add(term.ms);
  // Enumerate wall-clock hour edges, retaining both occurrences at a DST fold.
  const firstDate = basisAt(lo, options).toISODate()!;
  for (let d = -1; d <= 2; d++)
    for (const hour of [0, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23]) {
      const nominal = DateTime.fromISO(firstDate, { zone: "UTC" })
        .plus({ days: d })
        .set({ hour });
      if (options.timeMode === "mean-solar")
        add(nominal.minus({ minutes: options.longitude * 4 }).toMillis());
      else {
        const local = DateTime.fromObject(
          { year: nominal.year, month: nominal.month, day: nominal.day, hour },
          { zone: options.timezone },
        );
        if (
          local.toFormat("yyyy-MM-dd HH:mm") !==
          nominal.toFormat("yyyy-MM-dd HH:mm")
        )
          continue;
        for (const occurrence of local.getPossibleOffsets())
          add(occurrence.toMillis());
      }
    }
  // Split at civil-offset transitions, including half-hour DST changes.
  let previous = lo;
  for (
    let ms = Math.min(lo + 3600000, hi);
    previous < hi;
    ms = Math.min(ms + 3600000, hi)
  ) {
    const offset = (t: number) =>
      DateTime.fromMillis(t, { zone: options.timezone }).offset;
    if (offset(previous) !== offset(ms)) {
      let a = previous,
        b = ms;
      while (b - a > 1000) {
        const mid = Math.floor((a + b) / 2000) * 1000;
        if (offset(mid) === offset(previous)) a = mid;
        else b = mid;
      }
      add(b);
    }
    previous = ms;
  }
  const sorted = [...points].sort((a, b) => a - b);
  return sorted.slice(0, -1).map((a, i) => {
    const b = sorted[i + 1],
      localStart = DateTime.fromMillis(a, { zone: options.timezone }),
      localEnd = DateTime.fromMillis(b, { zone: options.timezone });
    const clock = localProfile(Math.floor((a + b) / 2), options, terms);
    const clockLabel = (d: DateTime) =>
      d.toFormat(d.second ? "HH:mm:ss" : "HH:mm");
    const from = clockLabel(localStart),
      until = b === hi ? "24:00" : clockLabel(localEnd);
    return {
      ...clock,
      id: `${a}-${b}`,
      start: a,
      end: b,
      from,
      until,
      offset: localStart.toFormat("ZZ"),
      endOffset: localEnd.toFormat("ZZ"),
      profile: { ...clock.profile, from, until },
    };
  });
}

export function calculateLocalDay(
  date: string,
  options: ClockOptions,
): CalendarDay {
  const { start, end } = bounds(date, options);
  const windows = calculateHourWindows(date, options);
  const noon = start.set({ hour: 12 }).toMillis();
  const central =
    windows.find((w) => w.start <= noon && w.end > noon) ?? windows[0];
  const lunar = Solar.fromYmd(start.year, start.month, start.day).getLunar();
  const profiles: DayProfile[] = [];
  for (const w of windows) {
    const previous = profiles.at(-1);
    if (
      previous &&
      previous.dayPillar === w.dayPillar &&
      previous.monthPillar === w.profile.monthPillar &&
      previous.yearPillar === w.profile.yearPillar
    )
      previous.until = w.until;
    else profiles.push({ ...w.profile });
  }
  const term = termInstants(start, end).find(
    (t) => t.ms >= start.toMillis() && t.ms < end.toMillis(),
  );
  return {
    date,
    day: start.day,
    weekday: start.weekday - 1,
    pillar: central.dayPillar,
    animal: branches.indexOf(central.dayPillar[1]),
    lunarDay: lunar.getDay(),
    lunarMonth: lunar.getMonth(),
    lunarYear: lunar.getYear(),
    profiles,
    term: term
      ? {
          han: term.han,
          name: solarTerms[term.han] ?? term.han,
          time: DateTime.fromMillis(term.ms, {
            zone: options.timezone,
          }).toFormat("HH:mm:ss"),
          changesMonth: term.changesMonth,
        }
      : null,
  };
}
export function calculateLocalMonth(
  year: number,
  month: number,
  options: ClockOptions,
) {
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    year < MIN_YEAR ||
    year > MAX_YEAR ||
    month < 1 ||
    month > 12
  )
    throw new Error("Проверьте месяц и год.");
  return Array.from({ length: SolarUtil.getDaysOfMonth(year, month) }, (_, i) =>
    calculateLocalDay(
      `${year}-${String(month).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`,
      options,
    ),
  );
}

export function assessHour(window: HourWindow, activity: string) {
  const day = assessActivity(window.profile, activity);
  const reasons: AssessmentReason[] = [];
  const add = (
    id: string,
    title: string,
    detail: string,
    tone: AssessmentTone,
  ) => reasons.push({ id, title, detail, tone });
  if (window.good.includes(activity))
    add(
      "hour-yi",
      "Дело поддержано часом",
      "В таблице часа есть отдельное поддерживающее указание для выбранного дела.",
      "good",
    );
  if (
    window.bad.includes(activity) ||
    [...window.good, ...window.bad].includes("诸事不宜")
  )
    add(
      "hour-ji",
      "Ограничение часа",
      "В таблице часа есть прямое или общее ограничение.",
      "bad",
    );
  if (
    !window.good.includes(activity) &&
    [...window.good, ...window.bad].includes("馀事勿取")
  )
    add(
      "hour-other",
      "Без дополнительных начинаний",
      "Выбранного дела нет среди исключений этого периода.",
      "bad",
    );
  const major = !["扫舍", "栽种", "拆卸", "会亲友", "安床"].includes(activity);
  if (major && window.clash)
    add(
      "hour-clash",
      "Час сталкивается с днём",
      "Противоположные ветви дня и часа ограничивают начало важного дела.",
      "bad",
    );
  if (
    window.empty &&
    ["出行", "移徙", "开市", "交易", "立券", "置产"].includes(activity)
  )
    add(
      "hour-empty",
      "Пустота часа",
      "Ветвь часа попадает в пустоту декады дня. Дополнительная оговорка для поездок и коммерческих начинаний.",
      "caution",
    );
  add(
    "hour-deity",
    deityNames[window.deity] ?? window.deity,
    window.deityGood
      ? "Поддерживающий фон часа. Сам по себе не отменяет ограничения."
      : "Ограничивающий фон часа: крупное начинание требует дополнительной проверки.",
    major && !window.deityGood ? "caution" : "neutral",
  );
  const hourTone: AssessmentTone = reasons.some((r) => r.tone === "bad")
    ? "bad"
    : reasons.some((r) => r.tone === "caution")
      ? "caution"
      : reasons.some((r) => r.tone === "good")
        ? "good"
        : "neutral";
  const tone: AssessmentTone =
    day.tone === "bad" || hourTone === "bad"
      ? "bad"
      : day.tone === "caution" || hourTone === "caution"
        ? "caution"
        : day.tone === "good" && hourTone === "good"
          ? "good"
          : day.tone === "good" || hourTone === "good"
            ? "caution"
            : "neutral";
  const message =
    day.tone === "bad"
      ? "Ограничение дня сохраняется в этот час."
      : hourTone === "bad"
        ? "Для выбранного дела есть ограничение часа."
        : tone === "good"
          ? "День и час поддерживают выбранное дело."
          : tone === "neutral"
            ? "Недостаточно указаний для выбора этого интервала."
            : "Есть оговорки или поддержка только одного уровня. Посмотрите объяснение.";
  return { window, day, hourTone, tone, reasons, message };
}
