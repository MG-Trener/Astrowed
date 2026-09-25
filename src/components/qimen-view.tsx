"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import artwork from "@/assets/generated/qimen.webp";
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
    <div className="page-wrap expansion-page">
      <section className="module-hero">
        <div>
          <div className="eyebrow">奇門遁甲 / ВРЕМЯ И НАПРАВЛЕНИЕ</div>
          <h1>
            Ци Мэнь.
            <br />
            <em>Архитектура момента.</em>
          </h1>
          <p>
            Личная карта по времени рождения или карта выбранного события.
            Девять дворцов связывают направления, двери, звёзды и небесные
            стволы.
          </p>
          <a className="button primary" href="#qimen-calculator">
            Построить карту ↓
          </a>
        </div>
        <Image
          src={artwork}
          alt="Нефритовая доска из девяти ячеек под латунной компасной дугой"
          priority
          sizes="(max-width: 800px) 100vw, 55vw"
        />
      </section>
      <nav className="section-nav">
        <a href="#qimen-calculator">Расчёт</a>
        <Link href="/qimen/palaces">Справочник дворцов</Link>
        <a href="#qimen-method">Методика</a>
        <Link href="/reports">Отчёты</Link>
      </nav>
      <section id="qimen-calculator" className="exp-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">01 / ЛИЧНАЯ КАРТА</div>
            <h2>Выберите момент.</h2>
          </div>
          <p>
            В форме приведён пример. Замените дату, время и часовой пояс на
            свои.
          </p>
        </div>
        <MomentForm
          onCalculate={(input) =>
            setChart(calculateQimen(input, { system, ju, dun }))
          }
        >
          <label className="field">
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
            Сюнь: {chart.xun} · скрытый Цзя: {chart.concealed} · Чжи Фу:{" "}
            {chart.dutyStar} → дворец {chart.starTarget} · Чжи Ши:{" "}
            {doorNames[chart.dutyDoor]} → дворец {chart.doorTarget}. UTC:{" "}
            {chart.utc}.
          </p>
        </section>
      )}
      <section id="qimen-method" className="exp-section prose-grid">
        <div>
          <div className="eyebrow">ПРОЗРАЧНОСТЬ РАСЧЁТА</div>
          <h2>
            Одна карта.
            <br />
            Явные правила.
          </h2>
        </div>
        <div>
          <p>
            Автоматический вариант использует часовой вращающийся диск и метод
            Чай Бу: солнечный термин определяет Инь/Ян Дунь, а фу-тоу дня —
            верхний, средний или нижний юань. Термины сравниваются по реальному
            моменту в UTC+8, день и час — по выбранному местному времени.
          </p>
          <p>
            Ручной цзюй нужен специалисту для воспроизведения карты по
            собственной методике. Он меняет исходный номер и Дунь; дальнейшая
            раскладка остаётся вращающейся. Метод Чжи Жунь и летящий диск здесь
            не заявлены.
          </p>
          <p>
            Двери и звёзды несут традиционные символические значения. Для
            натального разбора используется момент рождения; для вопроса —
            выбранный момент события.
          </p>
        </div>
      </section>
    </div>
  );
}
