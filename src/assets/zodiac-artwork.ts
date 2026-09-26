import rat from "./generated/zodiac/rat.webp";
import ox from "./generated/zodiac/ox.webp";
import tiger from "./generated/zodiac/tiger.webp";
import rabbit from "./generated/zodiac/rabbit.webp";
import dragon from "./generated/zodiac/dragon.webp";
import snake from "./generated/zodiac/snake.webp";
import horse from "./generated/zodiac/horse.webp";
import goat from "./generated/zodiac/goat.webp";
import monkey from "./generated/zodiac/monkey.webp";
import rooster from "./generated/zodiac/rooster.webp";
import dog from "./generated/zodiac/dog.webp";
import pig from "./generated/zodiac/pig.webp";
import type { StaticImageData } from "next/image";
import type { ZodiacAnimal } from "@/components/palace-zodiac";

export const zodiacArtwork: Record<ZodiacAnimal, StaticImageData> = {
  rat, ox, tiger, rabbit, dragon, snake, horse, goat, monkey, rooster, dog, pig
};

