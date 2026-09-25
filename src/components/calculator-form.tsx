"use client";
import { useEffect, useState } from "react";
import type { BirthInput, Chart } from "@/domain/bazi/types";
import { ChartView } from "./chart-view";
import { HeroScene } from "@/scenes/hero-scene";
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
          <LocationPicker
            value={input}
            date={input.date}
            time={input.unknownTime ? "12:00" : input.time}
            onChange={(place) => setInput((prev) => ({ ...prev, ...place }))}
            onReady={setPlaceReady}
          />
          <p className="method-note full">
            Среднее солнечное время. Введите местное время по документам:
            исторический часовой пояс, летнее время и долгота учитываются
            автоматически. Самостоятельно вычитать часы не нужно. Уравнение
            времени не применяется.
          </p>
          <details className="form-section full">
            <summary>Методика и правила времени</summary>
            <div className="form">
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
            {placeReady ? `${input.timezone} · ` : ""}Год начинается в Ли Чунь ·
            Месяцы по солнечным терминам.
            <br />
            Историческое смещение UTC определяется по дате рождения.
          </p>
          {error && (
            <p className="error full" role="alert">
              {error}
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
