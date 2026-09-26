"use client";
import { useEffect, useMemo, useState } from "react";
import { DateTime } from "luxon";
import { animals } from "@/domain/bazi/catalog";
import { activityDescription } from "@/domain/calendar/engine";
import {
  assessmentLabels,
  assessmentSymbols,
  type AssessmentReason,
} from "@/domain/calendar/assessment";
import {
  assessHour,
  calculateHourWindows,
  type ClockOptions,
} from "@/domain/calendar/hours";
import styles from "./calendar-hours.module.css";

function Reasons({ items }: { items: AssessmentReason[] }) {
  return items.length ? (
    <ul className={styles.reasons}>
      {items.map((r) => (
        <li key={r.id} data-tone={r.tone}>
          <strong>
            {assessmentSymbols[r.tone]} {r.title}
          </strong>
          <p>{r.detail}</p>
        </li>
      ))}
    </ul>
  ) : (
    <p className={styles.muted}>
      Отдельных указаний для этого дела нет. Это не подтверждение
      благоприятности.
    </p>
  );
}
export function CalendarHours({
  date,
  activity,
  options,
  onDate,
}: {
  date: string;
  activity: string;
  options: ClockOptions;
  onDate: (date: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [now, setNow] = useState(0);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const timer = setInterval(tick, 30000);
    return () => clearInterval(timer);
  }, []);
  const calculated = useMemo(() => {
    try {
      return { windows: calculateHourWindows(date, options), error: "" };
    } catch (e) {
      return {
        windows: [],
        error: e instanceof Error ? e.message : "Не удалось рассчитать часы.",
      };
    }
  }, [date, options]);
  const results = useMemo(
    () => calculated.windows.map((w) => assessHour(w, activity)),
    [calculated.windows, activity],
  );
  const best = results.filter((r) => r.tone === "good");
  const offsetChanges =
    new Set(calculated.windows.flatMap((w) => [w.offset, w.endOffset])).size >
    1;
  const active =
    results.find((r) => r.window.id === selected) ??
    best[0] ??
    results.find((r) => r.window.start <= now && r.window.end > now) ??
    results[0];
  const displayDate = DateTime.fromISO(date)
    .setLocale("ru")
    .toFormat("d MMMM yyyy");
  const adjacent = useMemo(
    () =>
      [-1, 1].map((delta) => {
        const next = DateTime.fromISO(date, { zone: options.timezone }).plus({
          days: delta,
        });
        if (next.year < 1901 || next.year > 2099) return null;
        try {
          const windows = calculateHourWindows(next.toISODate()!, options).map(
            (w) => assessHour(w, activity),
          );
          const good = windows.filter((w) => w.tone === "good");
          const cautious = windows.filter((w) => w.tone === "caution");
          return {
            date: next.toISODate()!,
            label: next.setLocale("ru").toFormat("d MMMM"),
            good,
            cautious,
          };
        } catch {
          return null;
        }
      }),
    [date, options, activity],
  );
  return (
    <section
      id="calendar-hours"
      className={styles.hours}
      aria-label="Рекомендации по часам"
    >
      <div className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>ВЫБИРАЕМ ВРЕМЯ</span>
          <h2>{displayDate}</h2>
          <p>
            {activityDescription(activity).name} · {options.city} · местное
            время
          </p>
        </div>
        <div className={styles.dayNav}>
          <form
            className={styles.dateForm}
            onSubmit={(e) => {
              e.preventDefault();
              const raw = String(
                new FormData(e.currentTarget).get("hour-date"),
              );
              const next = DateTime.fromISO(raw);
              if (next.isValid && next.year >= 1901 && next.year <= 2099)
                onDate(raw);
            }}
          >
            <label className={styles.datePicker}>
              Выбрать дату
              <input
                type="date"
                min="1901-01-01"
                max="2099-12-31"
                name="hour-date"
                defaultValue={date}
                required
              />
            </label>
            <button
              type="submit"
              className={styles.applyDate}
              aria-label="Показать выбранную дату"
            >
              ↗
            </button>
          </form>
          {adjacent.map((d, i) => (
            <button
              key={i}
              type="button"
              disabled={!d}
              aria-label={i === 0 ? "Предыдущий день" : "Следующий день"}
              onClick={() => d && onDate(d.date)}
            >
              {i === 0 ? "←" : "→"}
            </button>
          ))}
        </div>
      </div>
      {calculated.error ? (
        <p role="alert">{calculated.error}</p>
      ) : (
        <>
          <div className={styles.overview} role="status">
            <span className={styles.overviewIcon} aria-hidden="true">
              {best.length ? "✧" : "◷"}
            </span>
            <div>
              <h3>
                {best.length
                  ? "Есть интервалы с поддержкой дня и часа"
                  : "Подходящих интервалов без оговорок нет"}
              </h3>
              <p>
                {best.length
                  ? best
                      .map((r) => `${r.window.from}–${r.window.until}`)
                      .join(" · ")
                  : "Посмотрите оговорки или сравните соседние дни. Благоприятный час не отменяет ограничений дня."}
              </p>
            </div>
          </div>
          <div className={styles.legend}>
            <span data-tone="good">＋ Поддержка дня и часа</span>
            <span data-tone="caution">△ Есть оговорки</span>
            <span data-tone="bad">− Есть ограничения</span>
            <span>· Нет указаний</span>
          </div>
          <div
            className={styles.timeline}
            role="group"
            aria-label="Интервалы местного времени"
          >
            {results.map((r) => {
              const current = r.window.start <= now && r.window.end > now;
              return (
                <button
                  type="button"
                  key={r.window.id}
                  data-tone={r.tone}
                  className={styles.slot}
                  aria-pressed={active?.window.id === r.window.id}
                  aria-label={`${r.window.from}–${r.window.until}, ${animals[r.window.animal]}, ${assessmentLabels[r.tone]}`}
                  onClick={() => {
                    setSelected(r.window.id);
                    if (window.matchMedia("(max-width: 600px)").matches)
                      requestAnimationFrame(() =>
                        document
                          .getElementById("calendar-hour-detail")
                          ?.scrollIntoView({
                            behavior: window.matchMedia(
                              "(prefers-reduced-motion: reduce)",
                            ).matches
                              ? "auto"
                              : "smooth",
                            block: "start",
                          }),
                      );
                  }}
                >
                  <span className={styles.slotTime}>
                    {r.window.from}
                    <small>{r.window.until}</small>
                  </span>
                  <span className={styles.slotSymbol}>{r.window.pillar}</span>
                  <span>{animals[r.window.animal]}</span>
                  {offsetChanges && (
                    <small>
                      UTC{r.window.offset}
                      {r.window.offset !== r.window.endOffset
                        ? ` → ${r.window.endOffset}`
                        : ""}
                    </small>
                  )}
                  <b>{assessmentSymbols[r.tone]}</b>
                  <small>{current ? "Сейчас" : assessmentLabels[r.tone]}</small>
                </button>
              );
            })}
          </div>
          <p className={styles.muted}>
            Выберите интервал, чтобы увидеть причины оценки. Граница интервала
            относится к следующему периоду. При переводе часов повторяющееся
            время различается смещением UTC.
          </p>
          {active && (
            <article
              id="calendar-hour-detail"
              className={styles.explanation}
              aria-live="polite"
            >
              <div className={styles.resultHeader} data-tone={active.tone}>
                <div>
                  <span className={styles.eyebrow}>ВЫБРАННЫЙ ИНТЕРВАЛ</span>
                  <h3>
                    {active.window.from} — {active.window.until}
                  </h3>
                  <p>
                    {animals[active.window.animal]} · {active.window.pillar} ·
                    UTC{active.window.offset}
                    {active.window.offset !== active.window.endOffset
                      ? ` → UTC${active.window.endOffset}`
                      : ""}
                  </p>
                </div>
                <span className={styles.verdict}>
                  {assessmentSymbols[active.tone]}{" "}
                  {assessmentLabels[active.tone]}
                </span>
              </div>
              <p className={styles.conclusion}>{active.message}</p>
              {active.window.calendarDate !== date && (
                <p className={styles.boundaryNote}>
                  По выбранному началу суток и солнечному режиму здесь действует
                  день{" "}
                  {DateTime.fromISO(active.window.calendarDate)
                    .setLocale("ru")
                    .toFormat("d MMMM")}{" "}
                  · {active.window.dayPillar}.
                </p>
              )}
              <div className={styles.reasonColumns}>
                <section>
                  <h4>
                    01 <span>Что задаёт день</span>
                  </h4>
                  <p className={styles.levelTone} data-tone={active.day.tone}>
                    {assessmentSymbols[active.day.tone]}{" "}
                    {assessmentLabels[active.day.tone]}
                  </p>
                  <Reasons items={active.day.reasons} />
                </section>
                <section>
                  <h4>
                    02 <span>Что добавляет час</span>
                  </h4>
                  <p className={styles.levelTone} data-tone={active.hourTone}>
                    {assessmentSymbols[active.hourTone]}{" "}
                    {assessmentLabels[active.hourTone]}
                  </p>
                  <Reasons items={active.reasons} />
                </section>
              </div>
            </article>
          )}
          <div className={styles.nearby}>
            <div>
              <span className={styles.eyebrow}>СРАВНИТЬ ДАТЫ</span>
              <h3>А если на день раньше или позже?</h3>
              <p className={styles.muted}>
                То же дело и город. Нажмите дату, чтобы открыть её часы.
              </p>
            </div>
            <div className={styles.nearbyCards}>
              {adjacent.map(
                (d, i) =>
                  d && (
                    <button
                      type="button"
                      key={d.date}
                      onClick={() => onDate(d.date)}
                    >
                      <small>
                        {i === 0 ? "НАКАНУНЕ" : "НА СЛЕДУЮЩИЙ ДЕНЬ"}
                      </small>
                      <strong>{d.label} ↗</strong>
                      <span
                        data-tone={
                          d.good.length
                            ? "good"
                            : d.cautious.length
                              ? "caution"
                              : "neutral"
                        }
                      >
                        {d.good.length
                          ? `${d.good.length} интервалов с поддержкой`
                          : d.cautious.length
                            ? "Только с оговорками"
                            : "Без поддержанных интервалов"}
                      </span>
                      <p>
                        {d.good.length
                          ? d.good
                              .slice(0, 2)
                              .map((r) => `${r.window.from}–${r.window.until}`)
                              .join(" · ")
                          : "Откройте расшифровку перед выбором."}
                      </p>
                    </button>
                  ),
              )}
            </div>
          </div>
          <details className={styles.method}>
            <summary>Как мы выбираем часы</summary>
            <p>
              Проверяем указания для дела, столкновение часа с днём, пустоту
              часа и фон двенадцати духов. Затем объединяем их с оценкой дня.
              Прямое ограничение любого уровня остаётся красным; оговорки или
              поддержка только одного уровня — золотыми. Зелёная отметка
              появляется при поддержке обоих уровней без найденных ограничений.
            </p>
            <p>
              Это общий традиционный выбор времени. Личная карта, направление
              поездки и расклад Ци Мэнь здесь не учитываются. Отсутствие
              ограничений не гарантирует результат. Необходимые повседневные
              дела не нужно откладывать из-за отметок календаря.
            </p>
          </details>
        </>
      )}
    </section>
  );
}
