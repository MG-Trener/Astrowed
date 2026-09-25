import { findInteractions } from "./relations";
import { Solar, LunarUtil } from "lunar-typescript";
import { DateTime } from "luxon";
import { z } from "zod";
import {
  animals,
  branches,
  elements,
  stemElement,
  stems,
  tenGodNames,
  type ElementId,
} from "./catalog";
import type { BirthInput, Chart, Pillar } from "./types";

export const birthSchema = z.object({
  name: z.string().trim().min(1, "Укажите имя").max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Укажите дату рождения"),
  time: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Время должно быть в формате ЧЧ:ММ"),
  unknownTime: z.boolean(),
  gender: z.enum(["female", "male"]),
  city: z.string().trim().min(1).max(120),
  timezone: z.string().min(1).max(80),
  longitude: z.number().min(-180).max(180),
  latitude: z.number().min(-90).max(90),
  dayBoundary: z.enum(["midnight", "zi"]),
  timeMode: z.enum(["civil", "mean-solar"]),
  dstChoice: z.enum(["reject", "earlier", "later"]),
});
export const demoInput: BirthInput = {
  name: "Демонстрационная карта",
  date: "1990-05-17",
  time: "10:30",
  unknownTime: false,
  gender: "female",
  city: "Алматы",
  timezone: "Asia/Almaty",
  longitude: 76.886,
  latitude: 43.238,
  dayBoundary: "midnight",
  timeMode: "civil",
  dstChoice: "reject",
};
export function normalizeTime(input: BirthInput) {
  const clock = input.unknownTime ? "12:00" : input.time;
  let civil = DateTime.fromISO(`${input.date}T${clock}`, {
    zone: input.timezone,
  });
  if (!civil.isValid || civil.year < 1901 || civil.year > 2099)
    throw new Error(
      "Укажите существующую дату 1901–2099 и корректный часовой пояс IANA.",
    );
  if (civil.toFormat("yyyy-MM-dd HH:mm") !== `${input.date} ${clock}`)
    throw new Error(
      "Это местное время отсутствует из-за перехода на летнее время. Уточните время рождения.",
    );
  const offsets = civil
    .getPossibleOffsets()
    .sort((a, b) => a.toMillis() - b.toMillis());
  if (offsets.length > 1 && !input.unknownTime) {
    if (input.dstChoice === "reject")
      throw new Error(
        "Это время встречается дважды при переходе DST. Выберите раннее или позднее вхождение в настройках.",
      );
    civil =
      input.dstChoice === "earlier" ? offsets[0] : offsets[offsets.length - 1];
  }
  const correctionMinutes =
    input.timeMode === "mean-solar" ? input.longitude * 4 - civil.offset : 0;
  const local =
    input.timeMode === "mean-solar"
      ? civil.toUTC().plus({ minutes: input.longitude * 4 })
      : civil;
  return { civil, local, correctionMinutes };
}
const solarFrom = (d: DateTime) =>
  Solar.fromYmdHms(d.year, d.month, d.day, d.hour, d.minute, d.second);
const branchElements: ElementId[] = [
  "water",
  "earth",
  "wood",
  "wood",
  "earth",
  "fire",
  "fire",
  "earth",
  "metal",
  "metal",
  "earth",
  "water",
];
export { findInteractions, annualPillar } from "./relations";
export function calculate(raw: unknown): Chart {
  const input = birthSchema.parse(raw);
  const { civil, local, correctionMinutes } = normalizeTime(input);
  // Solar term tables in lunar-typescript are expressed in UTC+8. Compare the
  // actual birth instant there; use the requested local clock only for day/hour.
  const term = solarFrom(civil.setZone("UTC+8")).getLunar().getEightChar();
  const clock = solarFrom(local).getLunar().getEightChar();
  clock.setSect(input.dayBoundary === "zi" ? 1 : 2);
  const master = clock.getDayGan();
  const make = (key: string, label: string, ganZhi: string): Pillar => {
    const [stem, branch] = [...ganZhi];
    const hidden = LunarUtil.ZHI_HIDE_GAN[branch] ?? [];
    const offset = LunarUtil.CHANG_SHENG_OFFSET[master];
    const stage =
      LunarUtil.CHANG_SHENG[
        (offset +
          (stems.indexOf(master) % 2 === 0 ? 1 : -1) *
            branches.indexOf(branch) +
          12) %
          12
      ];
    return {
      key,
      label,
      stem,
      branch,
      element: stemElement(stem),
      branchElement: branchElements[branches.indexOf(branch)],
      polarity: stems.indexOf(stem) % 2 === 0 ? "Ян" : "Инь",
      animal: animals[branches.indexOf(branch)],
      hidden,
      tenGod:
        key === "day"
          ? "Господин дня"
          : tenGodNames[LunarUtil.SHI_SHEN[master + stem]],
      hiddenGods: hidden.map(
        (s) => tenGodNames[LunarUtil.SHI_SHEN[master + s]],
      ),
      nayin: LunarUtil.NAYIN[ganZhi],
      stage,
    };
  };
  const pillars = [
    make("year", "ГОД", term.getYear()),
    make("month", "МЕСЯЦ", term.getMonth()),
    make("day", "ДЕНЬ", clock.getDay()),
  ];
  if (!input.unknownTime) pillars.push(make("hour", "ЧАС", clock.getTime()));
  const counts: Record<ElementId, number> = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };
  for (const pillar of pillars) {
    counts[pillar.element] += 1;
    for (const hidden of pillar.hidden)
      counts[stemElement(hidden)] += 1 / pillar.hidden.length;
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const distribution = Object.fromEntries(
    elements.map((e) => [e.id, Math.round((counts[e.id] / total) * 1000) / 10]),
  ) as Record<ElementId, number>;
  const yun = input.unknownTime
    ? null
    : term.getYun(input.gender === "male" ? 1 : 0, 2);
  const warnings = [
    "Распределение — доли видимых и скрытых стволов, без сезонных коэффициентов. Не является оценкой силы карты.",
    "Ба Цзы — традиционная интерпретационная система, а не научно подтверждённый прогноз.",
  ];
  if (input.unknownTime)
    warnings.unshift(
      "Время неизвестно: часовой столп и точный Да Юнь скрыты. Год/месяц показаны на полдень; в день солнечного перехода они требуют уточнения.",
    );
  if (input.timeMode === "mean-solar")
    warnings.push(
      "Используется среднее солнечное время. Уравнение времени не включено; это не истинное солнечное время.",
    );
  return {
    input,
    pillars,
    dayMaster: {
      stem: master,
      element: stemElement(master),
      polarity: stems.indexOf(master) % 2 === 0 ? "Ян" : "Инь",
    },
    distribution,
    interactions: findInteractions(pillars),
    luck: yun
      ? yun
          .getDaYun(10)
          .slice(1)
          .map((d) => ({
            startYear: d.getStartYear(),
            endYear: d.getEndYear(),
            startAge: d.getStartAge(),
            ganZhi: d.getGanZhi(),
          }))
      : [],
    luckStart: yun?.getStartSolar().toYmd() ?? null,
    forward: yun?.isForward() ?? null,
    method: {
      id: `jie-${input.dayBoundary}-${input.timeMode}`,
      version: "1.0.0",
      engineVersion: "astrowed-0.1.0/lunar-typescript-1.8.6",
      timezoneVersion: `Intl/IANA ${typeof process !== "undefined" ? (process.versions?.tz ?? "runtime") : "runtime"}`,
      localTime: local.toFormat("yyyy-MM-dd HH:mm"),
      utcTime: civil.toUTC().toISO()!,
      correctionMinutes: Math.round(correctionMinutes * 100) / 100,
      description: `Год: Ли Чунь · Месяц: цзе · Смена дня: ${input.dayBoundary === "zi" ? "23:00" : "00:00"} · ${input.timeMode === "civil" ? "Гражданское" : "Среднее солнечное"} время · Да Юнь: минутный метод (3 дня = 1 год)`,
    },
    warnings,
  };
}
