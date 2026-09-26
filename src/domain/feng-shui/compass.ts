import { palaceOf } from "./catalog";
import type { ElementId } from "../bazi/catalog";

export type Coordinates = { lat: number; lng: number };
export const normalizeBearing = (angle: number) => ((angle % 360) + 360) % 360;
const radians = (angle: number) => (angle * Math.PI) / 180;

// Earth plate, clockwise from north. Each mountain occupies [centre − 7.5, centre + 7.5).
// Reference: fengshuibazicentre.com/pdf/What%20is%20the%2024mountains.pdf
const rows: [string, string, string, ElementId][] = [
  ["子", "Цзы", "С-2", "water"],
  ["癸", "Гуй", "С-3", "water"],
  ["丑", "Чоу", "СВ-1", "earth"],
  ["艮", "Гэнь", "СВ-2", "earth"],
  ["寅", "Инь", "СВ-3", "wood"],
  ["甲", "Цзя", "В-1", "wood"],
  ["卯", "Мао", "В-2", "wood"],
  ["乙", "И", "В-3", "wood"],
  ["辰", "Чэнь", "ЮВ-1", "earth"],
  ["巽", "Сюнь", "ЮВ-2", "wood"],
  ["巳", "Сы", "ЮВ-3", "fire"],
  ["丙", "Бин", "Ю-1", "fire"],
  ["午", "У", "Ю-2", "fire"],
  ["丁", "Дин", "Ю-3", "fire"],
  ["未", "Вэй", "ЮЗ-1", "earth"],
  ["坤", "Кунь", "ЮЗ-2", "earth"],
  ["申", "Шэнь", "ЮЗ-3", "metal"],
  ["庚", "Гэн", "З-1", "metal"],
  ["酉", "Ю", "З-2", "metal"],
  ["辛", "Синь", "З-3", "metal"],
  ["戌", "Сюй", "СЗ-1", "earth"],
  ["乾", "Цянь", "СЗ-2", "metal"],
  ["亥", "Хай", "СЗ-3", "water"],
  ["壬", "Жэнь", "С-1", "water"],
];
export const compassDirections = [1, 8, 3, 4, 9, 2, 7, 6].map((id, i) => ({
  ...palaceOf(id),
  angle: i * 45,
  short: ["С", "СВ", "В", "ЮВ", "Ю", "ЮЗ", "З", "СЗ"][i],
}));
export const mountains = rows.map(([han, name, code, element], i) => ({
  han,
  name,
  code,
  element,
  angle: i * 15,
  start: normalizeBearing(i * 15 - 7.5),
  end: normalizeBearing(i * 15 + 7.5),
  direction: compassDirections[Math.floor(((i * 15 + 22.5) % 360) / 45)],
}));
export function mountainAt(angle: number) {
  return mountains[Math.floor(normalizeBearing(angle + 7.5) / 15)];
}
export function boundaryDistance(angle: number) {
  const within = normalizeBearing(angle + 7.5) % 15;
  return Math.min(within, 15 - within);
}
export function bearingBetween(
  from: Coordinates,
  to: Coordinates,
): number | null {
  const dLon = radians(to.lng - from.lng),
    a = radians(from.lat),
    b = radians(to.lat);
  const y = Math.sin(dLon) * Math.cos(b);
  const x =
    Math.cos(a) * Math.sin(b) - Math.sin(a) * Math.cos(b) * Math.cos(dLon);
  if (Math.abs(x) + Math.abs(y) < 1e-12) return null;
  return normalizeBearing((Math.atan2(y, x) * 180) / Math.PI);
}
export function polar(radius: number, angle: number) {
  return {
    x: 300 + radius * Math.sin(radians(angle)),
    y: 300 - radius * Math.cos(radians(angle)),
  };
}
export function sectorPath(
  inner: number,
  outer: number,
  start: number,
  end: number,
) {
  const a = polar(outer, start),
    b = polar(outer, end),
    c = polar(inner, end),
    d = polar(inner, start);
  return `M ${a.x} ${a.y} A ${outer} ${outer} 0 0 1 ${b.x} ${b.y} L ${c.x} ${c.y} A ${inner} ${inner} 0 0 0 ${d.x} ${d.y} Z`;
}
export const elementColors: Record<ElementId, string> = {
  wood: "#91d2ab",
  fire: "#f3a58c",
  earth: "#dec48c",
  metal: "#d6e0ee",
  water: "#8fcde8",
};
