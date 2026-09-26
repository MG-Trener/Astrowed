export const elements = [
  {
    id: "wood",
    symbol: "木",
    name: "Дерево",
    en: "WOOD",
    color: "#80c6a4",
    season: "Весна",
    quality: "Рост и направление",
    description:
      "Движение от корня к ветвям. В системе пяти элементов Дерево связано с весной и направлением на восток.",
    stems: "甲 乙",
    branches: "寅 卯",
  },
  {
    id: "fire",
    symbol: "火",
    name: "Огонь",
    en: "FIRE",
    color: "#e88a70",
    season: "Лето",
    quality: "Свет и раскрытие",
    description:
      "Движение вверх и наружу. Огонь связан с летом и направлением на юг.",
    stems: "丙 丁",
    branches: "巳 午",
  },
  {
    id: "earth",
    symbol: "土",
    name: "Земля",
    en: "EARTH",
    color: "#d7bb83",
    season: "Межсезонье",
    quality: "Опора и переход",
    description:
      "Центр и переход между сезонами. Земля связывает остальные фазы в непрерывный цикл.",
    stems: "戊 己",
    branches: "辰 戌 丑 未",
  },
  {
    id: "metal",
    symbol: "金",
    name: "Металл",
    en: "METAL",
    color: "#c7d1e0",
    season: "Осень",
    quality: "Форма и точность",
    description:
      "Движение внутрь, собирание и оформление. Металл связан с осенью и направлением на запад.",
    stems: "庚 辛",
    branches: "申 酉",
  },
  {
    id: "water",
    symbol: "水",
    name: "Вода",
    en: "WATER",
    color: "#81b9d7",
    season: "Зима",
    quality: "Глубина и течение",
    description:
      "Движение вниз и сохранение. Вода связана с зимой и направлением на север.",
    stems: "壬 癸",
    branches: "亥 子",
  },
] as const;
export type ElementId = (typeof elements)[number]["id"];
export const stems = [..."甲乙丙丁戊己庚辛壬癸"];
export const branches = [..."子丑寅卯辰巳午未申酉戌亥"];
export const animals = [
  "Крыса",
  "Бык",
  "Тигр",
  "Кролик",
  "Дракон",
  "Змея",
  "Лошадь",
  "Коза",
  "Обезьяна",
  "Петух",
  "Собака",
  "Свинья",
];
export const stemElement = (stem: string): ElementId =>
  elements[Math.floor(stems.indexOf(stem) / 2)]?.id ?? "earth";
export const elementOf = (id: ElementId) => elements.find((e) => e.id === id)!;
export const tenGodNames: Record<string, string> = {
  比肩: "Братство",
  劫财: "Грабитель богатства",
  食神: "Дух наслаждения",
  伤官: "Вызов власти",
  偏财: "Косвенное богатство",
  正财: "Прямое богатство",
  七杀: "Седьмой убийца",
  正官: "Прямая власть",
  偏印: "Косвенная печать",
  正印: "Прямая печать",
  日主: "Господин дня",
};
