"use client";
import { useEffect, useId, useMemo, useState } from "react";
import { DateTime } from "luxon";
import catalog from "@/data/city-catalog.json";
import {
  cityPlace,
  manualPlace,
  searchCities,
  type CityRow,
  type Place,
} from "@/domain/locations";

const cache = new Map<string, Promise<CityRow[]>>();
function loadCountry(country: string) {
  if (!cache.has(country)) {
    const url = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/locations/${country}.json?v=${catalog.version}`;
    cache.set(
      country,
      fetch(url)
        .then((response) => {
          if (!response.ok)
            throw new Error(
              "Не удалось загрузить справочник. Повторите поиск или укажите место вручную.",
            );
          return response.json() as Promise<CityRow[]>;
        })
        .catch((error) => {
          cache.delete(country);
          throw error;
        }),
    );
  }
  return cache.get(country)!;
}

export function LocationPicker({
  value,
  date,
  time,
  onChange,
  onReady,
  compact = false,
}: {
  compact?: boolean;
  value: Place;
  date: string;
  time: string;
  onChange: (place: Place) => void;
  onReady: (ready: boolean) => void;
}) {
  const id = useId();
  const [country, setCountry] = useState(
    (catalog.timezones as Record<string, string>)[value.timezone] ?? "KZ",
  );
  const [query, setQuery] = useState(value.city);
  const [selected, setSelected] = useState(true);
  const [open, setOpen] = useState(false);
  const [manual, setManual] = useState(false);
  const [draft, setDraft] = useState({
    city: "",
    timezone: "",
    latitude: "",
    longitude: "",
  });
  const [rows, setRows] = useState<CityRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [active, setActive] = useState(-1);
  const countries = catalog.countryLabels;
  useEffect(() => {
    let cancelled = false;
    setRows([]);
    setLoading(true);
    setError("");
    loadCountry(country)
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [country, retry]);
  const matches = useMemo(() => searchCities(rows, query), [rows, query]);
  function pick(row: CityRow) {
    const place = cityPlace(row);
    onChange(place);
    onReady(true);
    setQuery(place.city);
    setSelected(true);
    setOpen(false);
    setActive(-1);
  }
  function editManual(key: keyof typeof draft, text: string) {
    const next = { ...draft, [key]: text };
    setDraft(next);
    const place = manualPlace(
      next.city,
      next.timezone,
      next.latitude,
      next.longitude,
    );
    onReady(Boolean(place));
    setSelected(Boolean(place));
    if (place) onChange(place);
  }
  const clock = DateTime.fromISO(`${date}T${time || "12:00"}`, {
    zone: value.timezone,
  });
  return (
    <div className="location-picker full">
      <div className="location-heading">
        <span className="eyebrow">
          {compact ? "МЕСТО РОЖДЕНИЯ" : "МЕСТО РОЖДЕНИЯ / СОБЫТИЯ"}
        </span>
        <button
          type="button"
          className="text-button"
          onClick={() => {
            setManual(!manual);
            setSelected(false);
            onReady(false);
            setOpen(false);
            setDraft({
              city: query,
              timezone: "",
              latitude: "",
              longitude: "",
            });
          }}
        >
          {manual ? "Найти в справочнике" : "Указать вручную"}
        </button>
      </div>
      {manual ? (
        <div className="form-grid">
          <label className="field">
            Город вручную
            <input
              required
              maxLength={120}
              value={draft.city}
              onChange={(e) => editManual("city", e.target.value)}
            />
          </label>
          <label className="field">
            Часовой пояс IANA
            <input
              required
              placeholder="Например, Asia/Almaty"
              value={draft.timezone}
              onChange={(e) => editManual("timezone", e.target.value)}
            />
          </label>
          <label className="field">
            Широта
            <input
              required
              type="number"
              min={-90}
              max={90}
              step="any"
              value={draft.latitude}
              onChange={(e) => editManual("latitude", e.target.value)}
            />
          </label>
          <label className="field">
            Долгота (восток +)
            <input
              required
              type="number"
              min={-180}
              max={180}
              step="any"
              value={draft.longitude}
              onChange={(e) => editManual("longitude", e.target.value)}
            />
          </label>
        </div>
      ) : (
        <div className="location-search">
          <label className="field">
            Страна / территория
            <select
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                setQuery("");
                setSelected(false);
                onReady(false);
                setOpen(false);
                setActive(-1);
              }}
            >
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <div
            className="location-combobox"
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
            }}
          >
            <label className="field" htmlFor={id}>
              Город
            </label>
            <input
              id={id}
              className="search-input"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={open && matches.length > 0}
              aria-controls={`${id}-results`}
              aria-activedescendant={
                open && active >= 0 && matches[active]
                  ? `${id}-${matches[active][0]}`
                  : undefined
              }
              aria-describedby={`${id}-hint`}
              autoComplete="off"
              maxLength={120}
              value={query}
              placeholder="Начните вводить название"
              onFocus={() => setOpen(true)}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelected(false);
                onReady(false);
                setOpen(true);
                setActive(-1);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  setOpen(false);
                  setActive(-1);
                }
                if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                  e.preventDefault();
                  setOpen(true);
                  setActive((n) =>
                    e.key === "ArrowDown"
                      ? Math.min(n + 1, matches.length - 1)
                      : Math.max(n - 1, 0),
                  );
                }
                if (e.key === "Enter" && open && !selected) {
                  e.preventDefault();
                  if (active >= 0 && matches[active]) pick(matches[active]);
                }
              }}
            />
            {open && matches.length > 0 && (
              <ul
                id={`${id}-results`}
                role="listbox"
                aria-label="Найденные города"
                className="location-results"
              >
                {matches.map((row, index) => (
                  <li key={row[0]} role="presentation">
                    <button
                      type="button"
                      role="option"
                      id={`${id}-${row[0]}`}
                      aria-selected={active === index}
                      onClick={() => pick(row)}
                    >
                      <strong>{row[1]}</strong>
                      <span>
                        {row[2]} · {row[5]}
                      </span>
                      <small>
                        {row[3].toFixed(4)}°, {row[4].toFixed(4)}°
                      </small>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      <p id={`${id}-hint`} className="location-hint" role="status">
        {selected
          ? `${compact ? "" : `${value.city} · ${value.timezone} · `}${clock.isValid ? `UTC${clock.toFormat("ZZ")} на указанную дату` : "проверьте дату"}${compact ? "" : ` · ${value.latitude.toFixed(4)}°, ${value.longitude.toFixed(4)}°`}`
          : manual
            ? "Заполните название, часовой пояс и обе координаты. Параметры предыдущего города не используются."
            : loading
              ? "Загружаем города выбранной страны…"
              : error ||
                (query.trim().length < 2
                  ? "Введите минимум две буквы названия города."
                  : matches.length
                    ? "Выберите город из подсказок — обратите внимание на регион."
                    : "Совпадений нет. Попробуйте прежнее название, латиницу или ручной ввод.")}
      </p>
      {error && !manual && (
        <button
          type="button"
          className="text-button"
          onClick={() => setRetry((n) => n + 1)}
        >
          Загрузить справочник повторно
        </button>
      )}
      <small className="location-source">
        Справочник{" "}
        <a href="https://www.geonames.org/" target="_blank" rel="noreferrer">
          GeoNames
        </a>{" "}
        ·{" "}
        <a
          href="https://creativecommons.org/licenses/by/4.0/"
          target="_blank"
          rel="noreferrer"
        >
          CC BY 4.0
        </a>
        {!compact &&
          ". Время учитывает историю часового пояса. Для солнечного времени можно уточнить координаты вручную."}
      </small>
    </div>
  );
}
