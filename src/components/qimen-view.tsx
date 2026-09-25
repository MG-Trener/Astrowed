"use client";
import { useState } from "react";
import Link from "next/link";
import {
  calculateQimen,
  doorNames,
  starNames,
  spiritNames,
  doorMeaning,
  type QimenChart,
} from "@/domain/qimen/engine";
import { luoShuOrder } from "@/domain/feng-shui/catalog";
import { elementOf } from "@/domain/bazi/catalog";
import { MomentForm } from "./moment-form";

export function PalaceBoard({ chart }: { chart: QimenChart }) {
  const [selected, setSelected] = useState(chart.starTarget);
  const [layer, setLayer] = useState("all");
  const p = chart.palaces.find((p) => p.id === selected)!;
  return (
    <div className="palace-workspace">
      <div>
        <div className="panel-heading">
          <h2>Девять дворцов</h2>
          <span className="mono">ЮГ ↑ · СЕВЕР ↓</span>
        </div>
        <div className="chip-row no-print" aria-label="Слои карты">
          {[
            ["all", "Все слои"],
            ["stems", "Стволы"],
            ["doors", "Двери"],
            ["stars", "Звёзды"],
          ].map(([id, name]) => (
            <button
              key={id}
              className="chip"
              aria-pressed={layer === id}
              onClick={() => setLayer(id)}
            >
              {name}
            </button>
          ))}
        </div>
        <div className="palace-grid">
          {luoShuOrder.map((id) => {
            const cell = chart.palaces[id - 1];
            return (
              <button
                type="button"
                key={id}
                className={`palace-cell ${selected === id ? "selected" : ""}`}
                aria-pressed={selected === id}
                aria-label={`${cell.id}. ${cell.name}. ${cell.direction}`}
                onClick={() => setSelected(id)}
                style={
                  {
                    "--accent": elementOf(cell.element).color,
                  } as React.CSSProperties
                }
              >
                <span className="palace-cap">
                  {id} {cell.name}
                  <small>{cell.direction}</small>
                </span>
                {(layer === "all" || layer === "stems") && (
                  <strong className="palace-stems">
                    {cell.heaven}
                    <small> / {cell.earth}</small>
                    {cell.hosted && <sup>+{cell.hosted}</sup>}
                  </strong>
                )}
                {(layer === "all" || layer === "stars") && (
                  <span className="palace-star">
                    {cell.star}
                    {cell.hosted ? " · 禽" : ""}
                  </span>
                )}
                {(layer === "all" || layer === "doors") && (
                  <span className="palace-door">
                    {cell.door
                      ? `${cell.door} ${doorNames[cell.door]}`
                      : "寄 · Центр → Кунь"}
                  </span>
                )}
                {layer === "all" && (
                  <small>
                    {cell.spirit} {spiritNames[cell.spirit]}
                  </small>
                )}
                {(cell.dutyStar || cell.dutyDoor) && (
                  <span className="palace-badges">
                    {cell.dutyStar ? "Чжи Фу " : ""}
                    {cell.dutyDoor ? "Чжи Ши" : ""}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <p className="distribution-note">
          Крупный ствол — небесная тарелка, после / — земная; + обозначает
          размещённый ствол центра.
        </p>
      </div>
      <aside className="focus-panel" aria-live="polite">
        <span
          className="focus-trigram"
          style={{ color: elementOf(p.element).color }}
        >
          {p.trigram}
        </span>
        <div className="eyebrow">
          ДВОРЕЦ {p.id} / {p.direction}
        </div>
        <h2>
          {p.name} <span className="muted">{p.han}</span>
        </h2>
        <p>{p.theme}</p>
        {p.id === 5 ? (
          <p>
            В этой системе центр не получает отдельную дверь или духа. Тянь Цинь
            и ствол центра следуют вместе с Тянь Жуй; размещение отображается в
            соответствующем внешнем дворце.
          </p>
        ) : (
          <>
            <h3>
              {p.door} · Дверь «{doorNames[p.door]}»
            </h3>
            <p>{doorMeaning[p.door]}</p>
            <dl>
              <dt>Звезда</dt>
              <dd>
                {starNames[p.star]}
                {p.hosted ? " + Тянь Цинь" : ""}
              </dd>
              <dt>Дух</dt>
              <dd>
                {p.spirit} · {spiritNames[p.spirit]}
              </dd>
              <dt>Небо / земля</dt>
              <dd>
                {p.heaven} / {p.earth}
              </dd>
              <dt>Элемент дворца</dt>
              <dd>{elementOf(p.element).name}</dd>
            </dl>
          </>
        )}
        <p className="method-note">
          Это описание символических слоёв. Итоговый разбор связывает дворец с
          вопросом, стволами и остальной картой.
        </p>
      </aside>
    </div>
  );
}
export function QimenView() {
  const [chart, setChart] = useState<QimenChart | null>(null);
  const [system, setSystem] = useState<"chaibu" | "manual">("chaibu");
  const [ju, setJu] = useState(1);
  const [dun, setDun] = useState<"yang" | "yin">("yang");
  return (
    <div
      className={
        chart
          ? "page-wrap expansion-page"
          : "page-wrap calculator-compact compact-tool-page"
      }
    >
      <div className="page-title">
        <div>
          <h1>Ци Мэнь · девять дворцов</h1>
          <p>Укажите дату, время и место рождения или события.</p>
        </div>
      </div>
      {chart && (
        <button className="back-link" onClick={() => setChart(null)}>
          ← Изменить дату и место
        </button>
      )}
      <section id="qimen-calculator" hidden={Boolean(chart)}>
        <MomentForm
          onCalculate={(input) =>
            setChart(calculateQimen(input, { system, ju, dun }))
          }
        >
          <label className="field full">
            Система
            <select
              value={system}
              onChange={(e) => setSystem(e.target.value as typeof system)}
            >
              <option value="chaibu">
                Часовая · Чай Бу · вращающийся диск
              </option>
              <option value="manual">Вращающийся диск · ручной цзюй</option>
            </select>
          </label>
          {system === "manual" && (
            <>
              <label className="field">
                Дунь
                <select
                  value={dun}
                  onChange={(e) => setDun(e.target.value as typeof dun)}
                >
                  <option value="yang">Ян Дунь</option>
                  <option value="yin">Инь Дунь</option>
                </select>
              </label>
              <label className="field">
                Цзюй
                <select
                  value={ju}
                  onChange={(e) => setJu(Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </label>
            </>
          )}
        </MomentForm>
      </section>
      {chart && (
        <section className="exp-section" aria-label="Результат Ци Мэнь">
          <div className="result-heading">
            <div>
              <div className="eyebrow">
                {chart.input.name} / {chart.localTime} · {chart.input.timezone}
              </div>
              <h2>
                {chart.dun === "yang" ? "Ян" : "Инь"} Дунь · {chart.ju} цзюй
              </h2>
              <p>
                {chart.term} · {chart.yuan} юань · {chart.pillars.join(" / ")}
              </p>
            </div>
            <button className="button no-print" onClick={() => window.print()}>
              Печать / PDF ↓
            </button>
          </div>
          <PalaceBoard
            key={`${chart.utc}-${chart.ju}-${chart.dun}`}
            chart={chart}
          />
          <p className="method-note">
            {chart.method}
            <br />
            Введённое время: {chart.input.date} {chart.input.time} · Среднее
            солнечное: {chart.localTime} · Поправка:{" "}
            {Math.round(chart.correctionMinutes * 100) / 100} мин.
            <br />
            Сюнь: {chart.xun} · скрытый Цзя: {chart.concealed} · Чжи Фу:{" "}
            {chart.dutyStar} → дворец {chart.starTarget} · Чжи Ши:{" "}
            {doorNames[chart.dutyDoor]} → дворец {chart.doorTarget}. UTC:{" "}
            {chart.utc}.
          </p>
        </section>
      )}
      <details className="compact-tool-help">
        <summary>Методика и справочник</summary>
        <p>
          Часовой вращающийся диск, Чай Бу. Среднее солнечное время; смена дня в
          00:00. Ручной цзюй доступен в поле «Система». Вводите местное время
          без ручных поправок.
        </p>
        <Link href="/qimen/palaces">Справочник девяти дворцов ↗</Link>
      </details>
    </div>
  );
}
