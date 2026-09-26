import type { StaticImageData } from "next/image";
import { baziArtwork } from "./artwork";
import wood from "./generated/knowledge-wood.webp";
import fire from "./generated/knowledge-fire.webp";
import earth from "./generated/knowledge-earth.webp";
import metal from "./generated/knowledge-metal.webp";
import water from "./generated/knowledge-water.webp";
import time from "./generated/knowledge-time.webp";
import relations from "./generated/knowledge-relations.webp";
import cycles from "./generated/knowledge-cycles.webp";
import stars from "./generated/knowledge-stars.webp";
import dayMaster from "./generated/knowledge-day-master.webp";
import unknownTime from "./generated/knowledge-unknown-time.webp";
import solarTerms from "./generated/knowledge-solar-terms.webp";
import hiddenStems from "./generated/knowledge-hidden-stems.webp";
import elementBalance from "./generated/knowledge-element-balance.webp";
import personalGua from "./generated/knowledge-personal-gua.webp";
import compass from "./generated/knowledge-feng-shui-compass.webp";
import ninePalaces from "./generated/knowledge-qimen-nine-palaces.webp";
import eightDoors from "./generated/knowledge-qimen-eight-doors.webp";
const art: Record<string, { image: StaticImageData; alt: string }> = {
  "hidden-stems": {
    image: hiddenStems,
    alt: "Раскрытый нефритовый цилиндр с тремя светящимися минеральными сердцевинами",
  },
  "element-balance": {
    image: elementBalance,
    alt: "Пять разноцветных камней вокруг тонких латунных весов",
  },
  "personal-gua": {
    image: personalGua,
    alt: "Восьмиугольный нефритовый медальон внутри золотого кольца с жемчужными ориентирами",
  },
  "feng-shui-compass": {
    image: compass,
    alt: "Латунный компас на архитектурном плане рядом с нефритовой моделью дома",
  },
  "qimen-nine-palaces": {
    image: ninePalaces,
    alt: "Нефритовые павильоны вокруг светящегося центра на квадратной платформе",
  },
  "qimen-eight-doors": {
    image: eightDoors,
    alt: "Восемь светящихся нефритовых и латунных дверей вокруг каменного подиума",
  },
  "four-pillars": baziArtwork,
  "day-master": {
    image: dayMaster,
    alt: "Светящийся кристалл в центре нефритового компаса и латунных орбит",
  },
  "unknown-time": {
    image: unknownTime,
    alt: "Открытые карманные часы без стрелок, окутанные лёгким туманом",
  },
  "solar-terms": {
    image: solarTerms,
    alt: "Круглый сад четырёх сезонов вокруг светящегося солнца",
  },
  wood: {
    image: wood,
    alt: "Дерево с нефритовыми листьями и светящимися корнями в небесном кольце",
  },
  fire: {
    image: fire,
    alt: "Восходящее пламя над нефритовой чашей в космической обсерватории",
  },
  earth: {
    image: earth,
    alt: "Гора из охристого камня на круглой нефритовой основе",
  },
  metal: {
    image: metal,
    alt: "Скульптурная серебряная петля внутри латунной орбиты",
  },
  water: {
    image: water,
    alt: "Прозрачная водная лента и капли вокруг нефритовой сферы",
  },
  "solar-time": {
    image: time,
    alt: "Латунные солнечные часы, нефритовый гномон и дуга долготы",
  },
  "ten-gods": {
    image: relations,
    alt: "Группы камней, связанные золотыми нитями с центральной светящейся сферой",
  },
  "luck-cycles": {
    image: cycles,
    alt: "Спираль нефритовых ступеней через небесные орбиты",
  },
  "symbolic-stars": {
    image: stars,
    alt: "Скульптурное созвездие из жемчужных огней и золотых линий",
  },
};
export function articleArtwork(slug: string, symbol?: string | null) {
  const alias: Record<string, string> = {
    木: "wood",
    火: "fire",
    土: "earth",
    金: "metal",
    水: "water",
  };
  return art[slug] ?? art[alias[slug] ?? alias[symbol ?? ""]] ?? baziArtwork;
}
