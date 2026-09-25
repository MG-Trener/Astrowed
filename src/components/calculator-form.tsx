"use client";
import { useEffect, useState } from "react";
import type { BirthInput, Chart } from "@/domain/bazi/types";
import { ChartView } from "./chart-view";
import { Arrow } from "./icons";
import { LocationPicker } from "./location-picker";
import { demoInput } from "@/domain/bazi/engine";
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
    city: demoInput.city,
    timezone: demoInput.timezone,
    longitude: demoInput.longitude,
    latitude: demoInput.latitude,
    dayBoundary: "midnight",
    timeMode: "mean-solar",
    dstChoice: "reject",
  });
  const [chart, setChart] = useState<Chart | null>(null);
  const [placeReady, setPlaceReady] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const update = <K extends keyof BirthInput>(key: K, value: BirthInput[K]) =>
    setInput((prev) => ({ ...prev, [key]: value }));
  useEffect(() => {
    if (chart) window.scrollTo({ top: 0, behavior: "instant" });
  }, [chart]);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!placeReady) {
      setError("Выберите город из справочника или заполните место вручную.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (browserOnly) {
        const { calculateNew } = await import("@/domain/bazi/engine");
        setChart(calculateNew(input));
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
    <div className="page-wrap calculator-compact">
      <div className="page-title">
        <div>
          <h1>Калькулятор Ба Цзы</h1>
          <p>Дата, время и город рождения.</p>
        </div>
      </div>
      <div className="form-layout">
        <form className="form" onSubmit={submit}>
          <label className="field calculator-name">
            Имя
            <input
              required
              maxLength={100}
              autoComplete="given-name"
              placeholder="Ваше имя"
              value={input.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </label>
          <label className="field calculator-gender">
            Пол (для Да Юнь)
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
            Время рождения
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
          <LocationPicker
            compact
            value={input}
            date={input.date}
            time={input.unknownTime ? "12:00" : input.time}
            onChange={(place) => setInput((prev) => ({ ...prev, ...place }))}
            onReady={setPlaceReady}
          />
          <p className="method-note full">
            Среднее солнечное время · поправки автоматически.
          </p>
          {error.includes("дважды") && (
            <label className="field full">
              Уточните повторившееся время
              <select
                value={input.dstChoice}
                onChange={(e) =>
                  update("dstChoice", e.target.value as BirthInput["dstChoice"])
                }
              >
                <option value="reject">Выберите вхождение</option>
                <option value="earlier">Первое — до перевода часов</option>
                <option value="later">Второе — после перевода часов</option>
              </select>
            </label>
          )}
          {error && (
            <p className="error full" role="alert">
              {error.includes("дважды")
                ? "Это время встречается дважды при переводе часов. Выберите вхождение выше и повторите расчёт."
                : error}
            </p>
          )}
          <button
            type="submit"
            className="button primary full"
            disabled={busy || !placeReady}
          >
            {busy ? "Расчёт структуры карты…" : "Построить мою карту"}
            <Arrow />
          </button>
          <p className="legal-note full">
            {browserOnly
              ? "Данные остаются в браузере. Результат можно сохранить в PDF."
              : "Расчёт не сохраняется автоматически. Сохранение доступно в закрытом кабинете консультанта."}
          </p>
        </form>
      </div>
    </div>
  );
}
