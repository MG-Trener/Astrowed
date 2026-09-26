import type { QimenChart } from "./engine";

const hiddenJia: Record<string, string> = {
  甲子: "戊",
  甲戌: "己",
  甲申: "庚",
  甲午: "辛",
  甲辰: "壬",
  甲寅: "癸",
};

/** Day stem on the heaven plate, including the centre's travelling host. */
export function findLifePalace(chart: Pick<QimenChart, "pillars" | "palaces">) {
  const dayPillar = chart.pillars[2];
  const dayStem = dayPillar?.[0];
  const stem = dayStem === "甲" ? hiddenJia[dayPillar] : dayStem;
  if (!stem) return null;
  const palace = chart.palaces.find(
    (p) => p.id !== 5 && (p.heaven === stem || p.hosted === stem),
  );
  if (!palace) return null;
  return {
    id: palace.id,
    dayStem,
    stem,
    dayPillar,
    hosted: palace.hosted === stem,
  };
}
