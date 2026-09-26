import { stems, branches } from "./catalog";
import type { Chart, Pillar } from "./types";
export function findInteractions(pillars: Pick<Pillar, "stem" | "branch">[]) {
  const result: Chart["interactions"] = [];
  const rules = [
    {
      kind: "clash",
      name: "Столкновение",
      pairs: ["子午", "丑未", "寅申", "卯酉", "辰戌", "巳亥"],
      field: "branch",
    },
    {
      kind: "combination",
      name: "Сочетание ветвей",
      pairs: ["子丑", "寅亥", "卯戌", "辰酉", "巳申", "午未"],
      field: "branch",
    },
    {
      kind: "harm",
      name: "Вред",
      pairs: ["子未", "丑午", "寅巳", "卯辰", "申亥", "酉戌"],
      field: "branch",
    },
    {
      kind: "stem-combination",
      name: "Сочетание стволов",
      pairs: ["甲己", "乙庚", "丙辛", "丁壬", "戊癸"],
      field: "stem",
    },
  ] as const;
  for (let i = 0; i < pillars.length; i++)
    for (let j = i + 1; j < pillars.length; j++)
      for (const rule of rules) {
        const a = pillars[i][rule.field],
          b = pillars[j][rule.field];
        if (rule.pairs.some((pair) => pair === a + b || pair === b + a))
          result.push({
            name: rule.name,
            symbols: `${a} ↔ ${b}`,
            kind: rule.kind,
          });
      }
  return result.filter(
    (v, i, a) =>
      a.findIndex((x) => x.name === v.name && x.symbols === v.symbols) === i,
  );
}
export function annualPillar(year: number) {
  const n = (((year - 4) % 60) + 60) % 60;
  return stems[n % 10] + branches[n % 12];
}
