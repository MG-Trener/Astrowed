import { Solar } from "lunar-typescript";
import { DateTime } from "luxon";
import { normalizeTime } from "../bazi/engine";
import type { BirthInput } from "../bazi/types";
import { directionQualities, guaDirections, palaceOf } from "./catalog";

const root = (n: number): number => ((((n - 1) % 9) + 9) % 9) + 1;
export function guaForYear(year: number, gender: "male" | "female") {
  if (!Number.isInteger(year) || year < 1900 || year > 2099)
    throw new Error("Год Гуа: 1900–2099.");
  let number = root(gender === "male" ? 11 - root(year) : 4 + root(year));
  if (number === 5) number = gender === "male" ? 2 : 8;
  return {
    number,
    group: [1, 3, 4, 9].includes(number) ? "Восточная" : "Западная",
    palace: palaceOf(number),
    directions: guaDirections[number].map((id, i) => ({
      ...palaceOf(id),
      quality: directionQualities[i][0],
      hanQuality: directionQualities[i][1],
      meaning: directionQualities[i][2],
      favorable: i < 4,
    })),
  };
}
export function calculateGua(input: BirthInput) {
  const { civil } = normalizeTime(input);
  const china = civil.setZone("UTC+8");
  const liChun = Solar.fromYmd(china.year, 6, 1).getLunar().getJieQiTable()[
    "立春"
  ];
  const boundary = DateTime.fromSQL(liChun.toYmdHms(), { zone: "UTC+8" });
  const year =
    china.toMillis() < boundary.toMillis() ? china.year - 1 : china.year;
  const uncertain =
    input.unknownTime && boundary.setZone(input.timezone).toISODate() === input.date;
  return {
    ...guaForYear(year, input.gender),
    year,
    uncertain,
    boundary: boundary.setZone(input.timezone).toFormat("yyyy-MM-dd HH:mm"),
    method:
      "Ба Чжай · год меняется в точный момент Ли Чунь · Гуа 5: мужчина → 2, женщина → 8",
  };
}
