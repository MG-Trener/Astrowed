"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { Chart } from "@/domain/bazi/types";
import { elements, elementOf } from "@/domain/bazi/catalog";
import { DestinyMatrix } from "@/scenes/destiny-matrix";
import { ElementsReactor } from "@/scenes/elements-reactor";
import { Timeline } from "@/scenes/timeline";
import { PdfButton } from "./pdf-button";
import { ExtendedChart } from "./extended-chart";
import { useActiveChart } from "./active-chart";
export function ChartView({
  chart,
  demo = false,
  savedId,
  browserOnly = false,
}: {
  chart: Chart;
  demo?: boolean;
  savedId?: string;
  browserOnly?: boolean;
}) {
  const { remember, clear } = useActiveChart();
  useEffect(() => {
    if (!demo) remember(chart);
  }, [chart, demo, remember]);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [id, setId] = useState(savedId);
  const dayPillar =
    chart.pillars.find((pillar) => pillar.key === "day") ?? chart.pillars[2];
  const rankedElements = [...elements].sort(
    (a, b) => chart.distribution[b.id] - chart.distribution[a.id],
  );
  const leadingElement = rankedElements[0];
  const smallestElement = rankedElements[rankedElements.length - 1];
  const relationNames = [...new Set(chart.interactions.map((item) => item.name))];
  async function save() {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/charts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(chart.input),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setId(data.id);
      setMessage("Карта и клиент сохранены в Neon.");
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "Не удалось сохранить карту.",
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="page-wrap">
      <section className="print-report-cover print-only" aria-label="Обложка отчёта">
        <div className="print-cover-top">
          <span>ASTROWED</span>
          <span>BA ZI · 四柱</span>
        </div>
        <div className="print-cover-art" aria-hidden="true" />
        <div className="print-cover-copy">
          <div className="eyebrow">ЛИЧНАЯ КАРТА · ПЕРСОНАЛЬНЫЙ РАЗБОР</div>
          <h1>{chart.input.name}</h1>
          <p>
            {chart.input.date} ·{" "}
            {chart.input.unknownTime ? "Время неизвестно" : chart.input.time}
            <br />
            {chart.input.city} · {chart.input.timezone}
          </p>
        </div>
        <div className="print-cover-footer">
          <span>ЧЕЛОВЕК · ВРЕМЯ · ПРОСТРАНСТВО</span>
          <span>ASTROWED</span>
        </div>
      </section>
      <div className="page-title">
        <div>
          <div className="eyebrow">
            DESTINY MATRIX / {demo ? "ДЕМОНСТРАЦИОННАЯ КАРТА" : "ЛИЧНАЯ КАРТА"}
          </div>
          <h1>{demo ? "Восемь знаков. Одна история." : chart.input.name}</h1>
          <p>
            {chart.input.date} ·{" "}
            {chart.input.unknownTime ? "Время неизвестно" : chart.input.time} ·{" "}
            {chart.input.city} · {chart.input.timezone}
          </p>
        </div>
        <div className="actions">
          <Link href="/calculator" className="button" onNavigate={clear}>
            Новый расчёт
          </Link>
          {!browserOnly && !demo && !id && (
            <button className="button primary" disabled={saving} onClick={save}>
              {saving ? "Сохранение…" : "Сохранить карту"}
            </button>
          )}
          {!browserOnly && id && <PdfButton id={id} />}
          <button className="button" onClick={() => window.print()}>
            {browserOnly ? "Печать / сохранить PDF" : "Печать"}
          </button>
        </div>
      </div>
      {browserOnly && (
        <p className="method-note browser-only-note">
          Карта рассчитана в браузере и не сохранена в базе. Для сохранения
          файла выберите PDF в меню печати.
        </p>
      )}
      {message && (
        <p role="status" className="success">
          {message}{" "}
          {id && <Link href={`/chart/${id}`}>Открыть сохранённую карту →</Link>}
        </p>
      )}
      <section className="print-chart-summary print-only">
        <div className="print-summary-heading">
          <div>
            <div className="eyebrow">КАРТА В ОДНОМ ВЗГЛЯДЕ</div>
            <h2>Ключевые расчётные ориентиры</h2>
          </div>
          <span className="print-summary-seal" aria-hidden="true">
            命
          </span>
        </div>
        <div className="print-summary-grid">
          <article>
            <small>Господин дня</small>
            <strong>{chart.dayMaster.stem}</strong>
            <p>
              {chart.dayMaster.polarity} · {elementOf(chart.dayMaster.element).name}
            </p>
          </article>
          <article>
            <small>Дневной столп</small>
            <strong>
              {dayPillar?.stem}
              {dayPillar?.branch}
            </strong>
            <p>
              {dayPillar?.animal} · {dayPillar?.nayin}
              <br />
              Фаза жизни: {dayPillar?.stage}
            </p>
          </article>
          <article>
            <small>Состав пяти элементов</small>
            <strong>
              {leadingElement.symbol} {leadingElement.name}
            </strong>
            <p>
              Наибольшая доля: {chart.distribution[leadingElement.id]}%
              <br />
              Наименьшая: {smallestElement.name} ·{" "}
              {chart.distribution[smallestElement.id]}%
            </p>
          </article>
          <article>
            <small>Связи внутри карты</small>
            <strong>{chart.interactions.length}</strong>
            <p>
              {relationNames.length
                ? relationNames.slice(0, 3).join(" · ")
                : "Поддерживаемые парные связи не обнаружены"}
            </p>
          </article>
          <article>
            <small>Да Юнь</small>
            <strong>
              {chart.forward === null
                ? "—"
                : chart.forward
                  ? "→"
                  : "←"}
            </strong>
            <p>
              {chart.forward === null
                ? "Требуется время рождения"
                : chart.forward
                  ? "Прямое движение"
                  : "Обратное движение"}
              <br />
              {chart.luckStart ? `Начало: ${chart.luckStart}` : "Начало не рассчитано"}
            </p>
          </article>
          <article>
            <small>Время расчёта</small>
            <strong>{chart.input.timeMode === "mean-solar" ? "☉" : "◷"}</strong>
            <p>
              {chart.input.timeMode === "mean-solar"
                ? "Среднее солнечное время"
                : "Гражданское время"}
              <br />
              Расчётное: {chart.method.localTime}
            </p>
          </article>
        </div>
        <p className="print-summary-note">
          Проценты показывают состав видимых и скрытых стволов без сезонных
          коэффициентов и не являются оценкой силы карты или рекомендацией
          «добавить» какой-либо элемент.
        </p>
      </section>
      <nav
        className="chart-shortcuts no-print"
        aria-label="Перейти к разделу карты"
      >
        <a href="#chart-pillars">Столпы</a>
        <a href="#timeline">Периоды</a>
        <a href="#interpretation">Разбор и PDF ↓</a>
      </nav>
      <div className="chart-layout" id="chart-pillars">
        <section>
          <div className="panel-heading">
            <h2>Четыре столпа</h2>
            <span className="badge">四柱 · FOUR PILLARS</span>
          </div>
          <DestinyMatrix chart={chart} />
        </section>
        <section>
          <div className="panel-heading">
            <h2>Пять элементов</h2>
            <span style={{ color: elementOf(chart.dayMaster.element).color }}>
              {chart.dayMaster.stem} · {chart.dayMaster.polarity}{" "}
              {elementOf(chart.dayMaster.element).name}
            </span>
          </div>
          <ElementsReactor
            distribution={chart.distribution}
            master={chart.dayMaster.stem}
          />
          <div className="element-bars">
            {elements.map((e) => (
              <div className="element-bar" key={e.id}>
                <span>
                  {e.symbol} {e.name}
                </span>
                <div className="element-bar-track">
                  <i
                    style={{
                      width: `${chart.distribution[e.id]}%`,
                      background: e.color,
                    }}
                  />
                </div>
                <span>{chart.distribution[e.id]}%</span>
              </div>
            ))}
          </div>
          <p className="distribution-note">
            Ствол = 1 единица. Скрытые стволы каждой ветви вместе = 1 единица.
            Сезонность и трансформации не включены.
          </p>
        </section>
      </div>
      <section className="chart-section">
        <div className="panel-heading">
          <h2>Связи внутри карты</h2>
          <span className="mono">INTERACTIONS</span>
        </div>
        <div className="interaction-list">
          {chart.interactions.length ? (
            chart.interactions.map((r, i) => (
              <div className="interaction" key={i}>
                <span>{r.symbols}</span>
                <p>{r.name}</p>
              </div>
            ))
          ) : (
            <p className="muted">
              Поддерживаемые парные взаимодействия не обнаружены.
            </p>
          )}
        </div>
        <p className="distribution-note">
          Показаны столкновения, парные сочетания ветвей и стволов, вред.
          Наличие сочетания не означает автоматическую трансформацию.
        </p>
      </section>
      <Timeline chart={chart} />
      <ExtendedChart chart={chart} />
      <section className="chart-section">
        <div className="panel-heading">
          <h2>Прозрачная методика</h2>
          <span className="mono">V{chart.method.version}</span>
        </div>
        <p className="method-note">
          {chart.method.description}
          <br />
          Расчётное время: {chart.method.localTime} · поправка{" "}
          {chart.method.correctionMinutes} мин.
          <br />
          UTC: {chart.method.utcTime} · {chart.method.timezoneVersion}
          <br />
          {chart.method.engineVersion}
        </p>
        <div className="warning-list">
          {chart.warnings.map((w) => (
            <p key={w}>{w}</p>
          ))}
        </div>
      </section>
    </div>
  );
}
