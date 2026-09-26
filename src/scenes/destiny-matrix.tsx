"use client";
import { useState } from "react";
import { elementOf, stemElement } from "@/domain/bazi/catalog";
import type { Chart } from "@/domain/bazi/types";
import ratArtwork from "@/assets/generated/zodiac/rat.webp";
import oxArtwork from "@/assets/generated/zodiac/ox.webp";
import tigerArtwork from "@/assets/generated/zodiac/tiger.webp";
import rabbitArtwork from "@/assets/generated/zodiac/rabbit.webp";
import dragonArtwork from "@/assets/generated/zodiac/dragon.webp";
import snakeArtwork from "@/assets/generated/zodiac/snake.webp";
import horseArtwork from "@/assets/generated/zodiac/horse.webp";
import goatArtwork from "@/assets/generated/zodiac/goat.webp";
import monkeyArtwork from "@/assets/generated/zodiac/monkey.webp";
import roosterArtwork from "@/assets/generated/zodiac/rooster.webp";
import dogArtwork from "@/assets/generated/zodiac/dog.webp";
import pigArtwork from "@/assets/generated/zodiac/pig.webp";

const zodiacArtwork: Record<string, string> = {
  Крыса: ratArtwork.src,
  Бык: oxArtwork.src,
  Тигр: tigerArtwork.src,
  Кролик: rabbitArtwork.src,
  Дракон: dragonArtwork.src,
  Змея: snakeArtwork.src,
  Лошадь: horseArtwork.src,
  Коза: goatArtwork.src,
  Обезьяна: monkeyArtwork.src,
  Петух: roosterArtwork.src,
  Собака: dogArtwork.src,
  Свинья: pigArtwork.src,
};
export function DestinyMatrix({ chart }: { chart: Chart }) {
  const [selected, setSelected] = useState("day");
  const current =
    chart.pillars.find((p) => p.key === selected) ?? chart.pillars[2];
  return (
    <>
      <div className="pillar-wrap">
        <div className="pillars">
          {chart.pillars.map((p) => (
            <div
              className={`pillar ${p.key === selected ? "selected" : ""}`}
              data-branch={p.branch}
              key={p.key}
            >
              <img
                className="pillar-animal-art"
                src={zodiacArtwork[p.animal]}
                alt=""
                aria-hidden="true"
              />
              <div className="pillar-label">
                {p.label}
                {p.key === "day" ? " · 日主" : ""}
              </div>
              <button
                className="pillar-symbol"
                style={{ color: elementOf(p.element).color }}
                onClick={() => setSelected(p.key)}
                aria-label={`${p.label}: ${p.stem}, ${p.polarity} ${elementOf(p.element).name}`}
                aria-pressed={p.key === selected}
              >
                {p.stem}
              </button>
              <div className="pillar-polarity">
                {p.polarity} · {elementOf(p.element).name}
              </div>
              <button
                className="pillar-symbol branch"
                style={{ color: elementOf(p.branchElement).color }}
                onClick={() => setSelected(p.key)}
                aria-label={`${p.branch} — ${p.animal}`}
              >
                {p.branch}
              </button>
              <div className="pillar-animal">{p.animal}</div>
              <div className="pillar-hidden" aria-label="Скрытые стволы">
                {p.hidden.map((s) => (
                  <span
                    key={s}
                    style={{ color: elementOf(stemElement(s)).color }}
                  >
                    {s}
                  </span>
                ))}
              </div>
              <div className="pillar-god">{p.tenGod}</div>
              <div className="pillar-print-details">
                <span>
                  <b>Скрытые:</b>{" "}
                  {p.hidden
                    .map((stem, i) => `${stem} · ${p.hiddenGods[i]}`)
                    .join(" / ")}
                </span>
                <span>
                  <b>На Инь:</b> {p.nayin}
                </span>
                <span>
                  <b>Фаза:</b> {p.stage}
                </span>
              </div>
            </div>
          ))}
          {chart.input.unknownTime && (
            <div className="pillar">
              <div className="pillar-label">ЧАС</div>
              <div className="pillar-symbol muted">?</div>
              <p className="pillar-god">Время неизвестно</p>
            </div>
          )}
        </div>
      </div>
      <div className="pillar-detail">
        <strong>
          {current.label} · {current.stem}
          {current.branch}
        </strong>
        <br />
        Скрытые стволы:{" "}
        {current.hidden
          .map((s, i) => `${s} — ${current.hiddenGods[i]}`)
          .join(" · ")}
        <br />
        На Инь: {current.nayin} · Фаза жизни: {current.stage}
      </div>
    </>
  );
}
