"use client";
import { useState } from "react";
import type { BirthInput } from "@/domain/bazi/types";
import { palaceOf, luoShuOrder } from "@/domain/feng-shui/catalog";
import { elementOf } from "@/domain/bazi/catalog";
import { calculateGua } from "@/domain/feng-shui/gua";
import { accountFetch } from "@/services/account-client";
import { MomentForm } from "./moment-form";
import styles from "./gua-result.module.css";
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
    <section
      className={styles.result}
      aria-label="Ваше число Гуа и направления"
    >
      <header className={styles.summary}>
        <div className={styles.seal} aria-label={`Число Гуа ${result.number}`}>
          <span aria-hidden="true">{result.palace.trigram}</span>
          <strong>{result.number}</strong>
        </div>
        <div className={styles.identity}>
          <span className={styles.eyebrow}>ВАШЕ ЛИЧНОЕ ГУА</span>
          <h2>
            {result.palace.name} <span>{result.palace.han}</span>
          </h2>
          <p>
            {result.group} группа · {elementOf(result.palace.element).name}
          </p>
          <small>Солнечный год рождения · {result.year}</small>
        </div>
      </header>
      {[true, false].map((favorable) => (
        <section
          key={String(favorable)}
          className={styles.group}
          data-favorable={favorable}
        >
          <div className={styles.groupHeading}>
            <span className={styles.groupMark} aria-hidden="true">
              {favorable ? "✧" : "◇"}
            </span>
            <h3>
              {favorable
                ? "Благоприятные направления"
                : "Направления осторожности"}
            </h3>
            <span className={styles.count}>04</span>
          </div>
          <ul className={styles.directions}>
            {result.directions
              .filter((d) => d.favorable === favorable)
              .map((d) => (
                <li key={d.id} className={styles.card}>
                  <div className={styles.cardHeading}>
                    <span className={styles.trigram} aria-hidden="true">
                      {d.trigram}
                    </span>
                    <div>
                      <h4>{d.direction}</h4>
                      <span className={styles.bearing}>{d.degrees}</span>
                    </div>
                  </div>
                  <div className={styles.quality}>
                    <strong>{d.quality}</strong>
                    <span lang="zh" aria-hidden="true">
                      {d.hanQuality}
                    </span>
                  </div>
                  <p>{d.meaning}</p>
                </li>
              ))}
          </ul>
        </section>
      ))}
      <p className={styles.method}>
        {result.method}. Ли Чунь: {result.boundary}.{" "}
        {result.uncertain
          ? "Дата совпала с Ли Чунь при неизвестном времени: результат требует уточнения."
          : ""}{" "}
        Названия описывают традиционные соответствия, а не гарантированный
        результат.
      </p>
    </section>
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
          onCalculate={async (input) => {
            const next = await accountFetch<ReturnType<typeof calculateGua>>("/calculate", { kind: "gua", input });
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
