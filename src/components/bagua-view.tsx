"use client";
import { useState } from "react";
import type { BirthInput } from "@/domain/bazi/types";
import { palaceOf, luoShuOrder } from "@/domain/feng-shui/catalog";
import { elementOf } from "@/domain/bazi/catalog";
import { calculateGua } from "@/domain/feng-shui/gua";
import { MomentForm } from "./moment-form";
export function BaguaNavigator() {
  const [selected, setSelected] = useState(1);
  const p = palaceOf(selected);
  return (
    <div className="palace-workspace">
      <div>
        <div className="panel-heading">
          <h2>Багуа позднего неба</h2>
          <span className="mono">ЮГ ↑</span>
        </div>
        <div className="palace-grid bagua-grid">
          {luoShuOrder.map((id) => {
            const cell = palaceOf(id);
            return (
              <button
                key={id}
                className={`palace-cell ${id === selected ? "selected" : ""}`}
                aria-pressed={id === selected}
                onClick={() => setSelected(id)}
                style={
                  {
                    "--accent": elementOf(cell.element).color,
                  } as React.CSSProperties
                }
              >
                <small>{cell.direction}</small>
                <strong>{cell.trigram}</strong>
                <span>
                  {cell.name} {cell.han}
                </span>
                <small>
                  {id} · {elementOf(cell.element).name}
                </small>
              </button>
            );
          })}
        </div>
        <p className="distribution-note">
          Компасная схема: юг сверху. Север измеряется компасом, положение входа
          не задаёт север автоматически.
        </p>
      </div>
      <aside className="focus-panel" aria-live="polite">
        <div className="eyebrow">
          {p.direction} / {p.degrees}
        </div>
        <h2>
          {p.name} · {p.han}
        </h2>
        <p>{p.theme}</p>
        <h3>{elementOf(p.element).name}</h3>
        <p>{p.advice}</p>
        <p className="method-note">
          Сектор пространства, направление взгляда и личное Гуа — разные уровни
          анализа. Сначала определите центр и ориентацию плана, затем добавляйте
          остальные слои.
        </p>
      </aside>
    </div>
  );
}
export function GuaResult({
  result,
}: {
  result: ReturnType<typeof calculateGua>;
}) {
  return (
    <div className="gua-result">
      <div className="gua-number">
        <span>{result.palace.trigram}</span>
        <strong>{result.number}</strong>
        <p>
          {result.palace.name} · {result.group} группа
        </p>
        <small>Солнечный год: {result.year}</small>
      </div>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Направление</th>
              <th>Качество</th>
              <th>Традиционная тема</th>
            </tr>
          </thead>
          <tbody>
            {result.directions.map((d) => (
              <tr key={d.id}>
                <td>{d.direction}</td>
                <td>
                  <span className={d.favorable ? "positive-text" : "muted"}>
                    {d.quality}
                  </span>
                </td>
                <td>{d.meaning}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="method-note">
        {result.method}. Ли Чунь: {result.boundary}.{" "}
        {result.uncertain
          ? "Дата совпала с Ли Чунь при неизвестном времени: результат требует уточнения."
          : ""}{" "}
        Названия описывают традиционные соответствия, а не гарантированный
        результат.
      </p>
    </div>
  );
}
export function GuaCalculator() {
  const [source, setSource] = useState<BirthInput | null>(null);
  const [result, setResult] = useState<ReturnType<typeof calculateGua> | null>(
    null,
  );
  return (
    <>
      {result && (
        <button className="back-link" onClick={() => setResult(null)}>
          ← Изменить данные рождения
        </button>
      )}
      <div hidden={Boolean(result)}>
        <MomentForm
          gender
          label="Рассчитать Гуа"
          onCalculate={(input) => {
            const next = calculateGua(input);
            setSource(input);
            setResult(next);
          }}
        />
      </div>
      {result && (
        <>
          {source && (
            <p className="active-chart-caption">
              {source.date} ·{" "}
              {source.unknownTime ? "Время неизвестно" : source.time} ·{" "}
              {source.city}
            </p>
          )}
          <GuaResult result={result} />
        </>
      )}
    </>
  );
}
