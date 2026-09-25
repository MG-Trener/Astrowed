"use client";
import { useEffect, useState } from "react";
import type { BirthInput, Chart } from "@/domain/bazi/types";
import { ChartView } from "./chart-view";
import { HeroScene } from "@/scenes/hero-scene";
import { Arrow } from "./icons";
const cities = [
  {
    city: "Алматы",
    timezone: "Asia/Almaty",
    longitude: 76.886,
    latitude: 43.238,
  },
  {
    city: "Астана",
    timezone: "Asia/Almaty",
    longitude: 71.43,
    latitude: 51.128,
  },
  {
    city: "Кызылорда",
    timezone: "Asia/Qyzylorda",
    longitude: 65.509,
    latitude: 44.848,
  },
  {
    city: "Москва",
    timezone: "Europe/Moscow",
    longitude: 37.617,
    latitude: 55.756,
  },
  {
    city: "Санкт-Петербург",
    timezone: "Europe/Moscow",
    longitude: 30.315,
    latitude: 59.939,
  },
  {
    city: "Пекин",
    timezone: "Asia/Shanghai",
    longitude: 116.407,
    latitude: 39.904,
  },
  {
    city: "Нью-Йорк",
    timezone: "America/New_York",
    longitude: -74.006,
    latitude: 40.713,
  },
];
export function CalculatorForm({
  browserOnly = false,
}: {
  browserOnly?: boolean;
}) {
  const [input, setInput] = useState<BirthInput>({
    name: "",
    date: "1990-05-17",
    time: "10:30",
    unknownTime: false,
    gender: "female",
    ...cities[0],
    dayBoundary: "midnight",
    timeMode: "civil",
    dstChoice: "reject",
  });
  const [chart, setChart] = useState<Chart | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const update = <K extends keyof BirthInput>(key: K, value: BirthInput[K]) =>
    setInput((prev) => ({ ...prev, [key]: value }));
  useEffect(() => {
    if (chart) window.scrollTo({ top: 0, behavior: "instant" });
  }, [chart]);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (browserOnly) {
        const { calculate } = await import("@/domain/bazi/engine");
        setChart(calculate(input));
      } else {
        const r = await fetch("/api/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        const body = await r.json();
        if (!r.ok) throw new Error(body.error);
        setChart(body);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось выполнить расчёт.");
    } finally {
      setBusy(false);
    }
  }
  if (chart)
    return (
      <>
        <div className="page-wrap" style={{ paddingBottom: 0, minHeight: 0 }}>
          <button className="back-link" onClick={() => setChart(null)}>
            ← ИЗМЕНИТЬ ДАННЫЕ РОЖДЕНИЯ
          </button>
        </div>
        <ChartView chart={chart} browserOnly={browserOnly} />
      </>
    );
  return (
    <div className="page-wrap">
      <div className="page-title">
        <div>
          <div className="eyebrow">01 / НАЧАЛО ВАШЕГО ИССЛЕДОВАНИЯ</div>
          <h1>Момент, с которого всё началось.</h1>
          <p>
            Укажите данные рождения. Мы покажем их структуру в языке четырёх
            столпов и пяти элементов.
          </p>
        </div>
        <span className="badge">БЕЗ РЕГИСТРАЦИИ</span>
      </div>
      <div className="form-layout">
        <form className="form" onSubmit={submit}>
          <label className="field full">
            Как вас зовут
            <input
              required
              maxLength={100}
              autoComplete="given-name"
              placeholder="Ваше имя"
              value={input.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </label>
          <label className="field">
            Дата рождения
            <input
              type="date"
              required
              min="1901-01-01"
              max="2099-12-31"
              value={input.date}
              onChange={(e) => update("date", e.target.value)}
            />
          </label>
          <label className="field">
            Местное время рождения
            <input
              type="time"
              required={!input.unknownTime}
              disabled={input.unknownTime}
              value={input.time}
              onChange={(e) => update("time", e.target.value)}
            />
          </label>
          <label className="checkbox full">
            <input
              type="checkbox"
              checked={input.unknownTime}
              onChange={(e) => update("unknownTime", e.target.checked)}
            />
            Время рождения неизвестно
          </label>
          <label className="field">
            Пол для направления Да Юнь
            <select
              value={input.gender}
              onChange={(e) =>
                update("gender", e.target.value as BirthInput["gender"])
              }
            >
              <option value="female">Женский</option>
              <option value="male">Мужской</option>
            </select>
          </label>
          <label className="field">
            Место рождения
            <select
              value={
                cities.some((c) => c.city === input.city)
                  ? input.city
                  : "custom"
              }
              onChange={(e) => {
                const place = cities.find((c) => c.city === e.target.value);
                if (place) setInput((prev) => ({ ...prev, ...place }));
                else update("city", "Другой город");
              }}
            >
              {cities.map((c) => (
                <option key={c.city}>{c.city}</option>
              ))}
              <option value="custom">Другой город — указать вручную</option>
            </select>
          </label>
          <details
            className="form-section full"
            open={input.city === "Другой город" || undefined}
          >
            <summary>Место, часовой пояс и методика</summary>
            <div className="form">
              <label className="field full">
                Город
                <input
                  value={input.city}
                  required
                  maxLength={120}
                  onChange={(e) => update("city", e.target.value)}
                />
              </label>
              <label className="field full">
                Часовой пояс IANA
                <input
                  required
                  value={input.timezone}
                  onChange={(e) => update("timezone", e.target.value)}
                  placeholder="Asia/Almaty"
                />
              </label>
              <label className="field">
                Долгота
                <input
                  type="number"
                  min="-180"
                  max="180"
                  step="0.001"
                  required
                  value={input.longitude}
                  onChange={(e) => update("longitude", Number(e.target.value))}
                />
              </label>
              <label className="field">
                Широта
                <input
                  type="number"
                  min="-90"
                  max="90"
                  step="0.001"
                  required
                  value={input.latitude}
                  onChange={(e) => update("latitude", Number(e.target.value))}
                />
              </label>
              <label className="field">
                Смена дня
                <select
                  value={input.dayBoundary}
                  onChange={(e) =>
                    update(
                      "dayBoundary",
                      e.target.value as BirthInput["dayBoundary"],
                    )
                  }
                >
                  <option value="midnight">В полночь · 00:00</option>
                  <option value="zi">Начало Цзы · 23:00</option>
                </select>
              </label>
              <label className="field">
                Время расчёта
                <select
                  value={input.timeMode}
                  onChange={(e) =>
                    update("timeMode", e.target.value as BirthInput["timeMode"])
                  }
                >
                  <option value="civil">Гражданское</option>
                  <option value="mean-solar">Среднее солнечное</option>
                </select>
              </label>
              <label className="field full">
                Повторяющееся время при переходе DST
                <select
                  value={input.dstChoice}
                  onChange={(e) =>
                    update(
                      "dstChoice",
                      e.target.value as BirthInput["dstChoice"],
                    )
                  }
                >
                  <option value="reject">Запросить уточнение</option>
                  <option value="earlier">Первое вхождение</option>
                  <option value="later">Второе вхождение</option>
                </select>
              </label>
            </div>
          </details>
          <p className="method-note full">
            {input.timezone} · Год начинается в Ли Чунь · Месяцы по солнечным
            терминам.
            <br />
            Историческое смещение UTC определяется по дате рождения.
          </p>
          {error && (
            <p className="error full" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="button primary full" disabled={busy}>
            {busy ? "Расчёт структуры карты…" : "Построить мою карту"}
            <Arrow />
          </button>
          <p className="legal-note full">
            {browserOnly
              ? "Расчёт выполняется в вашем браузере. Данные рождения не отправляются на сервер. Карту можно распечатать или сохранить в PDF через меню печати."
              : "Расчёт не сохраняется автоматически. Сохранение доступно в закрытом кабинете консультанта."}
          </p>
        </form>
        <aside className="form-aside">
          <HeroScene />
          <div className="eyebrow">КАЖДАЯ ДЕТАЛЬ ИМЕЕТ ЗНАЧЕНИЕ</div>
          <h3>
            Точность начинается
            <br />с исходных данных.
          </h3>
          <p>
            Город и часовой пояс помогают определить момент рождения. Если время
            неизвестно, карта будет построена без часового столпа — с ясным
            обозначением границ расчёта.
          </p>
        </aside>
      </div>
    </div>
  );
}
