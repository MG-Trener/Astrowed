/** Presentation only: fixed compass positions, never inferred from a chart result.
 * South is at the top. Degrees are geographical bearings, clockwise from north.
 */
export const palaceZodiac = [
  { id: "rat", name: "Крыса", branch: "子", palace: 1, bearing: 0, side: "bottom", slot: 1 },
  { id: "ox", name: "Бык", branch: "丑", palace: 8, bearing: 30, side: "bottom", slot: 0 },
  { id: "tiger", name: "Тигр", branch: "寅", palace: 8, bearing: 60, side: "left", slot: 2 },
  { id: "rabbit", name: "Кролик", branch: "卯", palace: 3, bearing: 90, side: "left", slot: 1 },
  { id: "dragon", name: "Дракон", branch: "辰", palace: 4, bearing: 120, side: "left", slot: 0 },
  { id: "snake", name: "Змея", branch: "巳", palace: 4, bearing: 150, side: "top", slot: 0 },
  { id: "horse", name: "Лошадь", branch: "午", palace: 9, bearing: 180, side: "top", slot: 1 },
  { id: "goat", name: "Коза", branch: "未", palace: 2, bearing: 210, side: "top", slot: 2 },
  { id: "monkey", name: "Обезьяна", branch: "申", palace: 2, bearing: 240, side: "right", slot: 0 },
  { id: "rooster", name: "Петух", branch: "酉", palace: 7, bearing: 270, side: "right", slot: 1 },
  { id: "dog", name: "Собака", branch: "戌", palace: 6, bearing: 300, side: "right", slot: 2 },
  { id: "pig", name: "Свинья", branch: "亥", palace: 6, bearing: 330, side: "bottom", slot: 2 },
] as const;

export type ZodiacAnimal = (typeof palaceZodiac)[number]["id"];
export type ZodiacSide = (typeof palaceZodiac)[number]["side"];

/** Original lightweight line illustrations. ViewBox: 0 0 64 64.
 * No emoji, external images, fonts, trackers, or generated calculation text.
 */
export const zodiacPaths: Record<ZodiacAnimal, readonly string[]> = {
  rat: [
    "M19 29C6 28 7 12 17 12C24 12 27 20 24 24M45 29C58 28 57 12 47 12C40 12 37 20 40 24",
    "M19 31C18 20 46 20 45 31L41 44Q32 58 23 44Z",
    "M22 32L26 34M42 32L38 34M29 43Q32 40 35 43L32 46Z",
    "M23 40L10 36M23 44L9 45M41 40L54 36M41 44L55 45M32 46V50",
  ],
  ox: [
    "M21 25C10 28 7 19 10 9C12 18 17 18 22 17M43 25C54 28 57 19 54 9C52 18 47 18 42 17",
    "M20 20Q32 14 44 20L43 39Q49 52 32 54Q15 52 21 39Z",
    "M20 28L10 26Q10 35 21 35M44 28L54 26Q54 35 43 35",
    "M23 31L27 33M41 31L37 33M24 43Q32 39 40 43M26 47V48M38 47V48M28 52H36",
  ],
  tiger: [
    "M19 23C8 26 9 10 19 13L24 19M45 23C56 26 55 10 45 13L40 19",
    "M18 25Q32 13 46 25L48 37Q47 51 32 54Q17 51 16 37Z",
    "M25 20L28 27M39 20L36 27M32 18V28M28 24H36",
    "M21 32L27 34M43 32L37 34M17 34L23 37M47 34L41 37M17 42L23 43M47 42L41 43",
    "M28 41Q32 38 36 41L32 45ZM32 45Q27 50 24 46M32 45Q37 50 40 46",
  ],
  rabbit: [
    "M22 32C13 19 16 5 22 7C27 9 28 23 29 29M35 29C36 23 37 9 42 7C48 5 51 19 42 32",
    "M23 27L21 14M41 27L43 14",
    "M20 33Q32 25 44 33C53 47 45 55 32 55S11 47 20 33Z",
    "M23 40L25 39M41 40L39 39M29 46L32 48L35 46M32 48V52M22 46L12 44M42 46L52 44",
  ],
  dragon: [
    "M19 51Q10 35 22 26L20 17L29 22L31 11L36 20L45 17L42 27L54 33L48 40L38 39L34 48Z",
    "M22 26L31 28L38 24M31 28L36 33L41 32M43 29L48 32M42 37L46 35",
    "M19 33L11 29M18 39L9 39M20 46L13 51M26 47L26 55M34 48L39 53",
    "M48 40Q53 45 58 40M37 43Q48 50 52 47M22 32Q26 36 22 41L28 44",
  ],
  snake: [
    "M33 13C49 8 53 20 43 25L31 31C17 38 45 37 48 43C55 55 12 58 11 46C11 40 21 37 27 36",
    "M33 13C22 10 17 17 21 22L32 25L39 20",
    "M28 20L31 20M43 15L45 15M20 21L13 23L9 21M13 23L10 26",
    "M21 45C28 49 47 47 44 43M17 49Q33 55 49 47M34 29L39 31M27 32L30 35",
  ],
  horse: [
    "M16 53L23 34L18 30L26 16L28 7L35 15L43 18L52 34L48 41L37 39L33 54Z",
    "M35 15L43 10L42 18M25 19Q12 25 12 43L21 37M22 25L14 31M20 32L13 39",
    "M34 25L38 27M47 34L48 35M39 36L48 37M32 31L35 39M23 45L28 47",
  ],
  goat: [
    "M23 28C7 28 6 8 19 8C31 8 28 23 22 21C17 20 17 15 21 15M41 28C57 28 58 8 45 8C33 8 36 23 42 21C47 20 47 15 43 15",
    "M23 24Q32 20 41 24L42 39L37 48L32 53L27 48L22 39Z",
    "M22 29L13 28L17 36L23 36M42 29L51 28L47 36L41 36M26 34L29 35M38 34L35 35",
    "M29 43L32 45L35 43M32 45V50M28 51L32 58L36 51",
  ],
  monkey: [
    "M18 28C5 24 6 43 18 42M46 28C59 24 58 43 46 42",
    "M17 32C15 11 49 11 47 32L47 42Q45 55 32 55Q19 55 17 42Z",
    "M32 30C19 18 16 36 23 40C17 50 47 50 41 40C48 36 45 18 32 30Z",
    "M23 34H26M38 34H41M29 40L32 42L35 40M26 46Q32 50 38 46M29 15L33 10L37 15",
  ],
  rooster: [
    "M33 23C27 16 34 12 36 16C34 7 43 7 43 15C46 9 52 16 46 20",
    "M34 22Q45 16 48 25L55 28L47 31Q48 42 38 47C26 54 15 44 17 34L27 39L30 29Z",
    "M18 36C3 32 6 14 15 17Q24 20 24 33M18 36C9 29 12 21 16 24Q20 27 21 34",
    "M40 25H41M47 31Q54 39 44 37M29 35Q22 42 34 43L39 37M29 48L28 55H23M38 48L40 55H45",
  ],
  dog: [
    "M22 21C15 14 8 23 9 42Q15 49 20 38M42 21C49 14 56 23 55 42Q49 49 44 38",
    "M21 23Q32 15 43 23L46 41Q44 55 32 55Q20 55 18 41Z",
    "M23 32L26 33M41 32L38 33M26 42Q32 36 38 42L32 46Z",
    "M32 46Q27 50 24 47M32 46Q37 50 40 47M29 50V53M35 50V53",
  ],
  pig: [
    "M18 29L13 12L29 21M46 29L51 12L35 21",
    "M18 26C8 36 15 54 32 55C49 54 56 36 46 26Q32 17 18 26Z",
    "M19 19L21 25M45 19L43 25M22 33L25 34M42 33L39 34",
    "M23 44C23 35 41 35 41 44S23 53 23 44ZM28 42V46M36 42V46",
  ],
};
