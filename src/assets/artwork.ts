import observatory from "./generated/observatory.webp";
import wood from "./generated/wood.webp";
import fire from "./generated/fire.webp";
import earth from "./generated/earth.webp";
import metal from "./generated/metal.webp";
import water from "./generated/water.webp";
import type { ElementId } from "@/domain/bazi/catalog";

export const observatoryArtwork = {
  image: observatory,
  alt: "Обсерватория времени: металлические орбиты вокруг светящегося нефритового ядра",
};
export const elementArtwork: Record<
  ElementId,
  { image: typeof wood; alt: string }
> = {
  wood: {
    image: wood,
    alt: "Дерево: изогнутая древесная форма с молодыми листьями",
  },
  fire: {
    image: fire,
    alt: "Огонь: восходящая спираль медного пламени и искр",
  },
  earth: {
    image: earth,
    alt: "Земля: парящий монолит с тёплыми слоями осадочной породы",
  },
  metal: {
    image: metal,
    alt: "Металл: точная петля из шлифованной серебристой ленты",
  },
  water: {
    image: water,
    alt: "Вода: прозрачная сапфировая волна с каплями и бликами",
  },
};
