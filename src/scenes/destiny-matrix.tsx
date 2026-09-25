"use client";
import { useState } from "react";
import { elementOf, stemElement } from "@/domain/bazi/catalog";
import type { Chart } from "@/domain/bazi/types";
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
              key={p.key}
            >
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
