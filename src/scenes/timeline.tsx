"use client";
import { useState } from "react";
import type { Chart } from "@/domain/bazi/types";
import { annualPillar, findInteractions } from "@/domain/bazi/relations";
export function Timeline({ chart }: { chart: Chart }) {
  const [year, setYear] = useState(2026);
  const [yearDraft, setYearDraft] = useState("2026");
  const selected = chart.luck.find(
    (d) => year >= d.startYear && year <= d.endYear,
  );
  const annual = annualPillar(year);
  const relations = findInteractions([
    ...chart.pillars,
    { stem: annual[0], branch: annual[1] },
    ...(selected
      ? [{ stem: selected.ganZhi[0], branch: selected.ganZhi[1] }]
      : []),
  ]);
  return (
    <section id="timeline" className="chart-section">
      <div className="panel-heading">
        <div>
          <div className="eyebrow">03 / ВРЕМЕННЫЕ СЛОИ</div>
          <h2 style={{ marginTop: 10 }}>Ритмы жизни</h2>
        </div>
        <label className="field">
          Годовой слой
          <input
            type="number"
            aria-label="Годовой слой"
            min="1901"
            max="2199"
            value={yearDraft}
            onChange={(e) => {
              setYearDraft(e.target.value);
              const n = Number(e.target.value);
              if (n >= 1901 && n <= 2199) setYear(n);
            }}
            onBlur={() => setYearDraft(String(year))}
          />
        </label>
      </div>
      {chart.luck.length ? (
        <>
          <p className="distribution-note">
            Да Юнь · {chart.forward ? "Прямое" : "Обратное"} движение · начало{" "}
            {chart.luckStart} (UTC+8). Возраст — традиционный номинальный.
          </p>
          <div className="timeline">
            {chart.luck.map((period) => (
              <button
                key={period.startYear}
                aria-pressed={selected?.startYear === period.startYear}
                onClick={() => {
                  setYear(period.startYear);
                  setYearDraft(String(period.startYear));
                }}
              >
                <small>
                  {period.startAge}–{period.startAge + 9} лет
                </small>
                <strong>{period.ganZhi}</strong>
                <span>
                  {period.startYear} — {period.endYear}
                </span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <p className="method-note">
          Для точного начала Да Юнь укажите время рождения.
        </p>
      )}
      <div className="timeline-info">
        <strong>
          {year} · {annual}
        </strong>{" "}
        — годовой столп после Ли Чунь.
        {selected
          ? ` Период Да Юнь: ${selected.ganZhi}.`
          : " Выбранный год вне показанных периодов."}
        <br />
        {relations.length
          ? relations
              .map((r) => `${r.symbols} ${r.name.toLowerCase()}`)
              .join(" · ")
          : "В выбранных слоях не обнаружены поддерживаемые парные взаимодействия."}
      </div>
    </section>
  );
}
