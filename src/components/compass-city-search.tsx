"use client";
import { useEffect, useId, useMemo, useState } from "react";
import catalog from "@/data/city-catalog.json";
import { searchCities, type CityRow } from "@/domain/locations";
import type { Coordinates } from "@/domain/feng-shui/compass";
import styles from "./feng-compass.module.css";

export function CompassCitySearch({
  onSelect,
}: {
  onSelect: (center: Coordinates, name: string) => void;
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
    setStatus("Загрузка городов…");
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
          setStatus(
            "Справочник недоступен. Укажите координаты ниже или повторите загрузку.",
          );
      });
    return () => controller.abort();
  }, [country, retry]);
  const matches = useMemo(() => searchCities(rows, query), [rows, query]);
  const pick = (row: CityRow) => {
    setQuery(row[1]);
    setOpen(false);
    setActive(-1);
    onSelect({ lat: row[3], lng: row[4] }, row[1]);
  };
  return (
    <div className={styles.search}>
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
        className={styles.searchField}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
        }}
      >
        <label htmlFor={id}>Город</label>
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
          value={query}
          placeholder="Например, Астана"
          autoComplete="off"
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
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
            id={`${id}-list`}
            role="listbox"
            aria-label="Найденные города"
            className={styles.results}
          >
            {matches.map((row, i) => (
              <li key={row[0]} role="presentation">
                <button
                  id={`${id}-${row[0]}`}
                  role="option"
                  aria-selected={i === active}
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
            Город не найден. Попробуйте другое название или координаты.
          </small>
        )}
      </div>
      {status && (
        <p role="status">
          {status}
          {status.includes("недоступен") && (
            <button onClick={() => setRetry((n) => n + 1)}>Повторить</button>
          )}
        </p>
      )}
    </div>
  );
}
