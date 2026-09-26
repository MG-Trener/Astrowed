"use client";
import { useEffect, useId, useMemo, useState } from "react";
import catalog from "@/data/city-catalog.json";
import { searchCities, type CityRow } from "@/domain/locations";
import type { ClockOptions } from "@/domain/calendar/hours";
import styles from "./calendar-hours.module.css";

export function CalendarLocation({
  value,
  onChange,
}: {
  value: ClockOptions;
  onChange: (value: ClockOptions) => void;
}) {
  const id = useId();
  const [country, setCountry] = useState("KZ"),
    [query, setQuery] = useState("");
  const [rows, setRows] = useState<CityRow[]>([]),
    [status, setStatus] = useState("");
  const [open, setOpen] = useState(false),
    [active, setActive] = useState(-1),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setRows([]);
    setStatus("Загружаем города…");
    fetch(
      `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/locations/${country}.json?v=${catalog.version}`,
      { signal: controller.signal },
    )
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        setRows(data);
        setStatus("");
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setStatus("Не удалось загрузить города. Текущий город сохранён.");
      });
    return () => controller.abort();
  }, [country, retry]);
  const matches = useMemo(() => searchCities(rows, query), [rows, query]);
  const pick = (row: CityRow) => {
    onChange({ ...value, city: row[1], longitude: row[4], timezone: row[5] });
    setQuery("");
    setOpen(false);
    setActive(-1);
  };
  return (
    <details className={styles.location}>
      <summary>
        <span className={styles.pin} aria-hidden="true">
          ◎
        </span>
        <span>
          <strong>{value.city}</strong>
          <small>
            {value.timeMode === "civil"
              ? "По часам города"
              : "По солнечному времени"}{" "}
            · новый день с{" "}
            {value.dayBoundary === "midnight" ? "00:00" : "23:00"}
          </small>
        </span>
        <span className={styles.change}>Изменить город и время ⌄</span>
      </summary>
      <div className={styles.settings}>
        <label>
          Страна
          <select
            value={country}
            onChange={(e) => {
              setCountry(e.target.value);
              setQuery("");
              setActive(-1);
            }}
          >
            {catalog.countryLabels.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <div
          className={styles.cityField}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
          }}
        >
          <label htmlFor={id}>Найти город</label>
          <input
            id={id}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={open && matches.length > 0}
            aria-controls={`${id}-list`}
            aria-activedescendant={
              open && active >= 0 && matches[active]
                ? `${id}-${matches[active][0]}`
                : undefined
            }
            placeholder="Введите название города"
            autoComplete="off"
            value={query}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              setActive(-1);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
              if (["ArrowDown", "ArrowUp"].includes(e.key)) {
                e.preventDefault();
                setOpen(true);
                setActive((n) =>
                  Math.max(
                    0,
                    Math.min(
                      matches.length - 1,
                      n + (e.key === "ArrowDown" ? 1 : -1),
                    ),
                  ),
                );
              }
              if (e.key === "Enter" && open && matches[active]) {
                e.preventDefault();
                pick(matches[active]);
              }
            }}
          />
          {open && matches.length > 0 && (
            <ul
              className={styles.cityResults}
              id={`${id}-list`}
              role="listbox"
              aria-label="Города календаря"
            >
              {matches.map((row, i) => (
                <li key={row[0]} role="presentation">
                  <button
                    type="button"
                    id={`${id}-${row[0]}`}
                    role="option"
                    aria-selected={active === i}
                    onClick={() => pick(row)}
                  >
                    <strong>{row[1]}</strong>
                    <small>{row[2]}</small>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {open && query.trim().length >= 2 && !matches.length && !status && (
            <small role="status">
              Город не найден. Попробуйте другое название.
            </small>
          )}
        </div>
        <label>
          Основа расчёта
          <select
            value={value.timeMode}
            onChange={(e) =>
              onChange({
                ...value,
                timeMode: e.target.value as ClockOptions["timeMode"],
              })
            }
          >
            <option value="civil">По часам города</option>
            <option value="mean-solar">Среднее солнечное время</option>
          </select>
        </label>
        <label>
          Начало нового дня
          <select
            value={value.dayBoundary}
            onChange={(e) =>
              onChange({
                ...value,
                dayBoundary: e.target.value as ClockOptions["dayBoundary"],
              })
            }
          >
            <option value="midnight">В полночь · 00:00</option>
            <option value="zi">С часа Крысы · 23:00</option>
          </select>
        </label>
        <p className={styles.settingsNote}>
          Выбрано: <strong>{value.city}</strong>. Все интервалы показаны по
          местным часам с учётом перевода часов. Солнечный режим сдвигает расчёт
          по долготе города; сезонная поправка истинного солнечного времени не
          применяется.
        </p>
        {status && (
          <p role="status">
            {status}{" "}
            {status.includes("Не удалось") && (
              <button type="button" onClick={() => setRetry((n) => n + 1)}>
                Повторить
              </button>
            )}
          </p>
        )}
      </div>
    </details>
  );
}
