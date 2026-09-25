"use client";
import { useEffect, useMemo, useState } from "react";
import { DateTime } from "luxon";
import type { Chart } from "@/domain/bazi/types";
import {
  currentEnergies,
  detailedLuck,
  godThemes,
  interpretChart,
  lifeYears,
  symbolicStars,
} from "@/domain/bazi/extended";
import { calculateGua } from "@/domain/feng-shui/gua";
import { GuaResult } from "./bagua-view";
import { ReportPreview } from "./report-preview";

export function StarsTable({
  chart,
  foundOnly = false,
}: {
  chart: Chart;
  foundOnly?: boolean;
}) {
  const rows = symbolicStars(chart).filter(
    (r) => !foundOnly || r.positions.length,
  );
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>Звезда / маркер</th>
            <th>Ищем</th>
            <th>Основание</th>
            <th>В карте</th>
            <th>Тема</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>
                {r.name}
                <small>
                  {r.han} · {r.kind === "star" ? "Шэнь Ша" : "маркер"}
                </small>
              </td>
              <td className="han-cell">{r.target}</td>
              <td>{r.basis}</td>
              <td>{r.positions.join(", ") || "Не обнаружено"}</td>
              <td>{r.meaning}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && (
        <p className="method-note">
          Поддерживаемые звёзды в известных столпах не обнаружены.
        </p>
      )}
    </div>
  );
}
export function EnergiesPanel({ chart }: { chart: Chart }) {
  const [date, setDate] = useState("2026-09-25");
  const [time, setTime] = useState("12:00");
  const [layers, setLayers] = useState<ReturnType<typeof currentEnergies>>([]);
  const [error, setError] = useState("");
  function run(d = date, t = time) {
    try {
      setLayers(currentEnergies(chart, d, t));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка расчёта");
      setLayers([]);
    }
  }
  useEffect(() => {
    const now = DateTime.now().setZone(chart.input.timezone);
    const d = now.toISODate()!,
      t = now.toFormat("HH:mm");
    setDate(d);
    setTime(t);
    try {
      setLayers(currentEnergies(chart, d, t));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка расчёта");
    }
  }, [chart]);
  return (
    <>
      <form
        className="inline-form no-print"
        onSubmit={(e) => {
          e.preventDefault();
          run();
        }}
      >
        <label className="field">
          Дата энергии
          <input
            type="date"
            required
            min="1901-01-01"
            max="2099-12-31"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <label className="field">
          Время
          <input
            type="time"
            required
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </label>
        <button className="button" type="submit">
          Обновить слои
        </button>
      </form>
      <p className="distribution-note">
        Часовой пояс: {chart.input.timezone}. Год и месяц меняются в точный
        момент солнечных терминов. День:{" "}
        {chart.input.dayBoundary === "zi" ? "с 23:00" : "с 00:00"}.
      </p>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <div className="energy-cards">
        {layers.map((p) => (
          <article key={p.key}>
            <span className="eyebrow">{p.label}</span>
            <strong>
              {p.stem}
              {p.branch}
            </strong>
            <h3>{p.tenGod}</h3>
            <p>{godThemes[p.tenGod]}</p>
            <div className="energy-relations">
              {p.relations.length ? (
                p.relations.map((r, i) => (
                  <p key={i}>
                    {r.position}: {r.symbols} · {r.name}
                  </p>
                ))
              ) : (
                <p>
                  Поддерживаемые парные связи с натальной картой не найдены.
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
export function LuckPanel({ chart }: { chart: Chart }) {
  return (
    <>
      <p className="method-note">
        Да Юнь:{" "}
        {chart.forward === null
          ? "нужно время рождения"
          : chart.forward
            ? "прямое движение"
            : "обратное движение"}
        . Даты приведены в UTC+8 с точностью до дня. Возраст — традиционный
        номинальный; полезность периода оценивается в контексте всей карты.
      </p>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Даты</th>
              <th>Возраст</th>
              <th>Столп / десять богов</th>
              <th>Тема периода</th>
              <th>Связи с картой</th>
            </tr>
          </thead>
          <tbody>
            {detailedLuck(chart).map((p) => (
              <tr key={p.startYear}>
                <td>
                  {p.startDate}
                  <br />— {p.endDate}
                </td>
                <td>
                  {p.startAge}–{p.startAge + 9}
                </td>
                <td>
                  <span className="han-cell">{p.ganZhi}</span>
                  <small>{p.tenGod}</small>
                </td>
                <td>{p.meaning}</td>
                <td>
                  {p.relations
                    .map((r) => `${r.position}: ${r.symbols} ${r.name}`)
                    .join("; ") || "Парных связей нет"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
export function LifeYearsPanel({ chart }: { chart: Chart }) {
  const years = useMemo(() => lifeYears(chart), [chart]);
  const [decade, setDecade] = useState(0);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(0);
  const visible = years
    .slice(decade * 10, decade * 10 + 10)
    .filter(
      (y) =>
        filter === "all" ||
        (filter === "clash"
          ? y.relations.some((r) => r.kind === "clash")
          : y.stars.length),
    );
  const focus = years[selected];
  return (
    <>
      <div className="chip-row no-print" aria-label="Десятилетие жизни">
        {Array.from({ length: 10 }, (_, i) => (
          <button
            className="chip"
            aria-pressed={decade === i}
            key={i}
            onClick={() => {
              setDecade(i);
              setSelected(i * 10);
            }}
          >
            {i * 10}–{i * 10 + 9}
          </button>
        ))}
      </div>
      <div className="inline-form no-print">
        <label className="field">
          Показать годы
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Все</option>
            <option value="clash">Со столкновениями</option>
            <option value="stars">С символическими звёздами</option>
          </select>
        </label>
      </div>
      <div className="life-strip">
        {visible.map((y) => (
          <button
            aria-pressed={focus.year === y.year}
            key={y.year}
            onClick={() => setSelected(y.age)}
          >
            <small>{y.age} лет</small>
            <strong>{y.ganZhi}</strong>
            <span>{y.year}</span>
            <i>{y.relations.length ? `${y.relations.length} связей` : "—"}</i>
          </button>
        ))}
      </div>
      {!visible.length && (
        <p className="method-note">
          В этом десятилетии нет лет по выбранному фильтру.
        </p>
      )}
      <article className="focus-panel life-focus">
        <div className="eyebrow">{focus.year} / ГОДОВОЙ СЛОЙ ПОСЛЕ ЛИ ЧУНЬ</div>
        <h3>
          {focus.ganZhi} · {focus.tenGod}
        </h3>
        <p>{godThemes[focus.tenGod]}</p>
        <p>
          Такт по календарному году:{" "}
          {focus.luck || "до начала / вне показанных тактов"}. В год смены
          уточняйте точную дату по таблице Да Юнь.
        </p>
        <p>
          {focus.relations
            .map((r) => `${r.position}: ${r.symbols} — ${r.name}`)
            .join("; ") ||
            "Поддерживаемые парные взаимодействия не обнаружены."}
        </p>
        <p>
          Шэнь Ша года:{" "}
          {focus.stars.join(", ") || "не обнаружены по поддерживаемым правилам"}
          .
        </p>
      </article>
      <p className="distribution-note">
        Возраст здесь — разница календарных лет, до дня рождения фактический
        возраст на год меньше. Связи не являются оценкой года как «хорошего» или
        «плохого».
      </p>
    </>
  );
}
export function ExtendedChart({
  chart,
  initial = "interpretation",
  standalone = false,
}: {
  chart: Chart;
  initial?: string;
  standalone?: boolean;
}) {
  const [tab, setTab] = useState(initial);
  const [found, setFound] = useState(false);
  const tabs = [
    ["interpretation", "Разбор"],
    ["energies", "Текущие энергии"],
    ["luck", "Такты"],
    ["years", "Годы жизни"],
    ["stars", "Звёзды / Шэнь Ша"],
    ["gua", "Гуа"],
    ["report", "PDF-отчёт"],
  ];
  return (
    <section className="chart-section extended-chart" id="interpretation">
      <div className="panel-heading">
        <div>
          <div className="eyebrow">
            {standalone ? "ПРИМЕР РАСШИФРОВКИ" : "ЛИЧНАЯ КАРТА / СЛОИ АНАЛИЗА"}
          </div>
          <h2>От структуры к смыслу.</h2>
        </div>
      </div>
      <div
        className="section-nav no-print"
        role="tablist"
        aria-label="Слои анализа"
      >
        {tabs.map(([id, name]) => (
          <button
            id={`tab-${id}`}
            key={id}
            role="tab"
            aria-selected={tab === id}
            aria-controls="analysis-panel"
            onClick={() => setTab(id)}
          >
            {name}
          </button>
        ))}
      </div>
      <div id="analysis-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {tab === "interpretation" && (
          <>
            <div className="editorial-grid">
              {interpretChart(chart).map((s) => (
                <article key={s.title} className="editorial-card">
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </article>
              ))}
            </div>
            <p className="method-note">
              Автоматический разбор Astrowed. Это справочные формулировки, а не
              личное заключение Юлии Гаврилычевой.
            </p>
          </>
        )}
        {tab === "energies" && <EnergiesPanel chart={chart} />}
        {tab === "luck" && <LuckPanel chart={chart} />}
        {tab === "years" && <LifeYearsPanel chart={chart} />}
        {tab === "stars" && (
          <>
            <label className="check-field no-print">
              <input
                type="checkbox"
                checked={found}
                onChange={(e) => setFound(e.target.checked)}
              />{" "}
              Только обнаруженные
            </label>
            <StarsTable chart={chart} foundOnly={found} />
            <p className="method-note">
              При неизвестном времени часовой столп не проверяется. Повторные
              основания одной звезды показаны отдельно; их эффекты не
              складываются автоматически.
            </p>
          </>
        )}
        {tab === "gua" && <GuaResult result={calculateGua(chart.input)} />}
        {tab === "report" && <ReportPreview chart={chart} />}
      </div>
    </section>
  );
}
