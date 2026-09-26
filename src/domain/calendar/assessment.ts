import { officers } from "./catalog";
import { activityDescription, type DayProfile } from "./engine";

// Explicit scope: everyday medical/legal obligations are never screened here.
export const assessedActivities = [
  "嫁娶",
  "移徙",
  "入宅",
  "开市",
  "立券",
  "交易",
  "出行",
  "会亲友",
  "入学",
  "修造",
  "动土",
  "安床",
  "扫舍",
  "拆卸",
  "栽种",
  "赴任",
  "置产",
] as const;
export type AssessmentTone = "good" | "bad" | "caution" | "neutral";
export type AssessmentReason = {
  id: string;
  title: string;
  detail: string;
  tone: AssessmentTone;
  source?: string;
};
export const assessmentLabels: Record<AssessmentTone, string> = {
  good: "Есть поддержка",
  bad: "Есть ограничения",
  caution: "С оговорками",
  neutral: "Нет достаточных указаний",
};
export const assessmentSymbols: Record<AssessmentTone, string> = {
  good: "＋",
  bad: "−",
  caution: "△",
  neutral: "·",
};
export const ruleSources = {
  almanac: "https://6tail.cn/calendar/lunar.yiji.html",
  officers:
    "https://www.bazichic.com/uploads/documents/bazichik20191227104900.pdf#page=14",
  danger: "https://xkfsa.wordpress.com/2021/06/21/date-selection-danger-day/",
  clash:
    "https://www.bazichic.com/uploads/documents/bazichik20191227104900.pdf#page=7",
  sha: "https://www.mingli.ru/27-09-2026",
  wealthless: "https://www.suanzhun.net/book/1985.html",
  seasons: "https://ctext.org/wiki.pl?chapter=609842&if=gb&remap=gb",
  deity: "https://6tail.cn/calendar/lunar.tianshen.html",
};

const major = new Set<string>([
  "嫁娶",
  "移徙",
  "入宅",
  "开市",
  "立券",
  "交易",
  "出行",
  "入学",
  "修造",
  "动土",
  "赴任",
  "置产",
]);
const commercial = new Set(["开市", "立券", "交易", "置产"]);
// A bounded mapping for the published activity vocabulary, not a universal score.
// Officer 8 follows the specific Danger-day reference (bed/groundwork exceptions).
const officerGood: string[][] = [
  ["开市", "赴任"],
  ["扫舍", "拆卸"],
  ["开市", "立券"],
  ["嫁娶", "修造", "出行"],
  ["嫁娶", "开市"],
  ["修造", "开市", "赴任"],
  ["拆卸"],
  ["动土", "安床", "拆卸"],
  ["嫁娶", "修造", "移徙", "入宅", "出行", "开市", "立券"],
  ["入学", "赴任", "交易"],
  ["嫁娶", "开市", "出行", "赴任"],
  [],
];
const officerBad: string[][] = [
  [],
  [],
  ["拆卸"],
  [],
  ["出行"],
  ["移徙", "入宅", "出行"],
  [...major],
  ["嫁娶", "出行"],
  [],
  [],
  ["拆卸"],
  [...major],
];

/** Astrowed v1 policy: named restrictions outrank support; cautions stay visible.
 * No weighting, probability, personal assessment or proprietary Mingli parity.
 */
export function assessActivity(profile: DayProfile, activity: string) {
  const reasons: AssessmentReason[] = [];
  const add = (reason: AssessmentReason) => reasons.push(reason);
  const good = profile.good.includes(activity);
  const bad = profile.bad.includes(activity);
  if (good)
    add({
      id: "yi",
      title: "Таблица 宜: поддержка",
      detail: "Дело перечислено среди поддерживаемых в таблице месяца и дня.",
      tone: "good",
      source: ruleSources.almanac,
    });
  if (bad)
    add({
      id: "ji",
      title: "Таблица 忌: ограничение",
      detail: "Дело прямо указано в списке ограничений альманаха.",
      tone: "bad",
      source: ruleSources.almanac,
    });
  if ([...profile.good, ...profile.bad].includes("诸事不宜"))
    add({
      id: "general",
      title: "Общее ограничение альманаха",
      detail:
        "Запись 诸事不宜 имеет приоритет над отдельной поддержкой в выбранной методике.",
      tone: "bad",
      source: ruleSources.almanac,
    });
  else if (!good && [...profile.good, ...profile.bad].includes("馀事勿取"))
    add({
      id: "general",
      title: "Без дополнительных начинаний",
      detail: "馀事勿取: поддержаны только специально перечисленные дела.",
      tone: "bad",
      source: ruleSources.almanac,
    });

  if (
    officerGood[profile.officer].includes(activity) ||
    officerBad[profile.officer].includes(activity)
  ) {
    const restrict = officerBad[profile.officer].includes(activity);
    add({
      id: "officer",
      title: `${profile.officer + 1}. ${officers[profile.officer][1]}`,
      detail: `${activityDescription(activity).name}: ${restrict ? "ограничивающее" : "поддерживающее"} соответствие типу дня по используемой таблице.`,
      tone: restrict ? "bad" : "good",
      source: profile.officer === 7 ? ruleSources.danger : ruleSources.officers,
    });
  } else if (profile.officer === 7 && major.has(activity)) {
    add({
      id: "officer",
      title: "8. Опасность",
      detail:
        "Для этого крупного начинания тип дня даёт оговорку; специальные исключения проверяются отдельно.",
      tone: "caution",
      source: ruleSources.danger,
    });
  }
  for (const flag of profile.flags) {
    if (flag.id.startsWith("clash-") && major.has(activity))
      add({
        id: flag.id,
        title: flag.name,
        detail:
          "Противоположные ветви ограничивают начало крупных дел в выбранной методике.",
        tone: "bad",
        source: ruleSources.clash,
      });
    if (flag.id.startsWith("sha-") && major.has(activity)) {
      const delayRestriction =
        flag.shaKind === 2 &&
        ["出行", "移徙", "入宅", "置产"].includes(activity);
      add({
        id: flag.id,
        title: flag.name,
        detail: delayRestriction
          ? "Ша задержек ограничивает поездки, переезд и операции с недвижимостью."
          : "Дополнительный признак осторожности. Без конкретного правила для дела он не превращается в полный запрет.",
        tone: delayRestriction ? "bad" : "caution",
        source: ruleSources.sha,
      });
    }
    if (flag.id === "wealthless" && commercial.has(activity))
      add({
        id: flag.id,
        title: flag.name,
        detail:
          "Лу дня попадает в пустоту декады. В этой методике ограничивается начало коммерческого дела; это не прогноз финансового результата.",
        tone: "bad",
        source: ruleSources.wealthless,
      });
    if (["separation", "exhaustion"].includes(flag.id) && major.has(activity))
      add({
        id: flag.id,
        title: flag.name,
        detail: flag.meaning,
        tone: "caution",
        source: ruleSources.seasons,
      });
  }
  if (major.has(activity))
    add({
      id: "deity",
      title: profile.deityGood ? "Жёлтый путь" : "Чёрный путь",
      detail:
        "Общий фон дня. Сам по себе не даёт зелёную оценку делу и не отменяет конкретные ограничения.",
      tone: profile.deityGood ? "neutral" : "caution",
      source: ruleSources.deity,
    });
  const supported = reasons.some((r) => r.tone === "good");
  const restricted = reasons.some((r) => r.tone === "bad");
  const cautious = reasons.some((r) => r.tone === "caution");
  const tone: AssessmentTone = restricted
    ? "bad"
    : cautious
      ? "caution"
      : supported
        ? "good"
        : "neutral";
  return {
    activity,
    tone,
    reasons,
    conflict: supported && (restricted || cautious),
  };
}
export function assessDayActivities(profile: DayProfile) {
  return assessedActivities.map((activity) =>
    assessActivity(profile, activity),
  );
}
