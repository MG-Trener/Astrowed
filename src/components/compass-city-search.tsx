"use client";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import catalog from "@/data/city-catalog.json";
import { searchCities, type CityRow } from "@/domain/locations";
import type { Coordinates } from "@/domain/feng-shui/compass";
import { searchAddress, type AddressMatch } from "@/services/compass-address";
import styles from "./feng-compass.module.css";

export function CompassCitySearch({
  onSelect,
}: {
  onSelect: (center: Coordinates, name: string, zoom?: number) => void;
}) {
  const id = useId();
  const [city, setCity] = useState<CityRow | null>(null);
  const [street, setStreet] = useState(""),
    [house, setHouse] = useState("");
  const [addresses, setAddresses] = useState<AddressMatch[]>([]);
  const [addressStatus, setAddressStatus] = useState("");
  const [addressRetry, setAddressRetry] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [addressOpen, setAddressOpen] = useState(false);
  const [addressActive, setAddressActive] = useState(-1);
  const addressRequest = useRef<AbortController | null>(null);
  const resolvedSelection = useRef("");
  const selectRef = useRef(onSelect);
  selectRef.current = onSelect;
  function clearAddressResult() {
    resolvedSelection.current = "";
    addressRequest.current?.abort();
    setAddresses([]);
    setSelectedAddress("");
    setAddressStatus("");
    setAddressActive(-1);
  }
  function showAddress(match: AddressMatch) {
    resolvedSelection.current = JSON.stringify([
      city?.[0],
      match.street || match.label,
      house,
    ]);
    setSelectedAddress(match.id);
    setStreet(match.street || match.label);
    setAddressOpen(false);
    setAddressActive(-1);
    selectRef.current(
      match.center,
      `${city?.[1]} · ${match.label}`,
      match.zoom,
    );
  }
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
  useEffect(() => {
    const controller = new AbortController();
    addressRequest.current = controller;
    if (
      resolvedSelection.current === JSON.stringify([city?.[0], street, house])
    )
      return () => controller.abort();
    if (!city || street.trim().length < 3) return () => controller.abort();
    setAddressStatus("Уточняем адрес…");
    let timeout: ReturnType<typeof setTimeout>;
    const timer = setTimeout(
      async () => {
        timeout = setTimeout(() => {
          controller.abort();
          setAddressStatus(
            "Поиск занял слишком много времени. Повторите попытку.",
          );
        }, 25000);
        try {
          const found = await searchAddress(
            {
              city: city[1],
              country,
              center: { lat: city[3], lng: city[4] },
              street,
              house,
            },
            controller.signal,
          );
          if (controller.signal.aborted) return;
          setAddresses(found);
          if (found.length) {
            const first = found[0];
            setSelectedAddress(first.id);
            selectRef.current(
              first.center,
              `${city[1]} · ${first.label}`,
              first.zoom,
            );
            setAddressStatus(
              found.length > 1
                ? "Адрес показан на карте. Другой вариант можно выбрать в поле адреса."
                : "Адрес показан на карте.",
            );
          } else
            setAddressStatus(
              house.trim()
                ? "Дом не найден. Проверьте номер или уберите его, чтобы найти улицу. Карта остаётся на прежнем месте."
                : "Улица не найдена. Уточните название. Карта остаётся на прежнем месте.",
            );
        } catch {
          if (!controller.signal.aborted)
            setAddressStatus(
              "Поиск адресов недоступен. Повторите попытку или укажите точку на карте.",
            );
        } finally {
          clearTimeout(timeout);
        }
      },
      city[1] === "Астана" && country === "KZ" ? 350 : 1200,
    );
    return () => {
      controller.abort();
      clearTimeout(timer);
      clearTimeout(timeout);
    };
  }, [city, country, street, house, addressRetry]);
  const pick = (row: CityRow) => {
    clearAddressResult();
    setCity(row);
    setStreet("");
    setHouse("");
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
            clearAddressResult();
            setCity(null);
            setStreet("");
            setHouse("");
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
            clearAddressResult();
            setCity(null);
            setStreet("");
            setHouse("");
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
      <div
        className={styles.addressFields}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setAddressOpen(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setAddressOpen(false);
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            setAddressOpen(true);
            setAddressActive((n) =>
              Math.max(
                0,
                Math.min(
                  addresses.length - 1,
                  n + (e.key === "ArrowDown" ? 1 : -1),
                ),
              ),
            );
          }
          if (e.key === "Enter" && addressOpen && addresses[addressActive]) {
            e.preventDefault();
            showAddress(addresses[addressActive]);
          }
        }}
      >
        <label>
          Улица <small>необязательно</small>
          <input
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={addressOpen && addresses.length > 0}
            aria-controls={`${id}-addresses`}
            aria-activedescendant={
              addressOpen && addressActive >= 0
                ? `${id}-address-${addressActive}`
                : undefined
            }
            value={street}
            disabled={!city}
            placeholder={city ? "Название улицы" : "Сначала выберите город"}
            autoComplete="off"
            maxLength={160}
            onFocus={() => setAddressOpen(true)}
            onChange={(e) => {
              clearAddressResult();
              setStreet(e.target.value);
              setAddressOpen(true);
              setHouse("");
              if (!e.target.value.trim() && city)
                onSelect({ lat: city[3], lng: city[4] }, city[1]);
            }}
          />
        </label>
        <label>
          Дом <small>если есть</small>
          <input
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={addressOpen && addresses.length > 0}
            aria-controls={`${id}-addresses`}
            aria-activedescendant={
              addressOpen && addressActive >= 0
                ? `${id}-address-${addressActive}`
                : undefined
            }
            value={house}
            disabled={!city || street.trim().length < 3}
            placeholder="№ / корпус"
            autoComplete="off"
            maxLength={30}
            onFocus={() => setAddressOpen(true)}
            onChange={(e) => {
              clearAddressResult();
              setHouse(e.target.value);
              setAddressOpen(true);
            }}
          />
        </label>
        {addressOpen && addresses.length > 0 && (
          <ul
            id={`${id}-addresses`}
            className={`${styles.results} ${styles.addressResults}`}
            role="listbox"
            aria-label="Найденные адреса"
          >
            {addresses.map((match, i) => (
              <li key={match.id} role="presentation">
                <button
                  type="button"
                  role="option"
                  id={`${id}-address-${i}`}
                  aria-selected={
                    addressActive === i ||
                    (addressActive < 0 && selectedAddress === match.id)
                  }
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => showAddress(match)}
                >
                  <strong>{match.label}</strong>
                  <small>{match.detail}</small>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className={styles.addressFeedback}>
        <p role="status">
          {addressStatus ||
            (city
              ? "Введите улицу, затем номер дома. Карта уточнится после паузы во вводе."
              : "Выберите город из списка — карта переместится к его центру.")}
        </p>
        {city &&
          street.trim().length >= 3 &&
          addressStatus !== "Уточняем адрес…" &&
          !addresses.length && (
            <button type="button" onClick={() => setAddressRetry((n) => n + 1)}>
              Повторить поиск
            </button>
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
