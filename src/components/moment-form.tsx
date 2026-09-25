"use client";
import { LocationPicker } from "./location-picker";
import { useState } from "react";
import { demoInput } from "@/domain/bazi/engine";
import type { BirthInput } from "@/domain/bazi/types";

export function MomentForm({
  onCalculate,
  children,
  label = "Построить карту",
  initial = demoInput,
  gender = false,
}: {
  onCalculate: (input: BirthInput) => void;
  children?: React.ReactNode;
  label?: string;
  initial?: BirthInput;
  gender?: boolean;
}) {
  const [input, setInput] = useState({
    ...initial,
    dayBoundary: "zi" as const,
  });
  const [placeReady, setPlaceReady] = useState(true);
  const [error, setError] = useState("");
  const update = <K extends keyof BirthInput>(key: K, value: BirthInput[K]) =>
    setInput((s) => ({ ...s, [key]: value }));
  return (
    <form
      className="moment-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!placeReady) {
          setError(
            "Выберите город из справочника или заполните место вручную.",
          );
          return;
        }
        setError("");
        try {
          onCalculate(input);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Проверьте данные.");
        }
      }}
    >
      <div className="form-grid">
        <label className="field">
          Имя / название события
          <input
            required
            maxLength={100}
            value={input.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </label>
        <label className="field">
          Дата
          <input
            required
            type="date"
            min="1901-01-01"
            max="2099-12-31"
            value={input.date}
            onChange={(e) => update("date", e.target.value)}
          />
        </label>
        <label className="field">
          Местное время
          <input
            required
            type="time"
            value={input.time}
            onChange={(e) => update("time", e.target.value)}
          />
        </label>
        {gender && (
          <label className="field">
            Пол для формулы Гуа
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
        )}
        {children}
      </div>
      <LocationPicker
        value={input}
        date={input.date}
        time={input.time}
        onChange={(place) => setInput((prev) => ({ ...prev, ...place }))}
        onReady={setPlaceReady}
      />
      <details className="method-details">
        <summary>Место и правила времени</summary>
        <div className="form-grid">
          <label className="field">
            Расчётное время
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
              <option value="zi">В 23:00</option>
              <option value="midnight">В 00:00</option>
            </select>
          </label>
          <label className="field">
            Повтор часа при переходе DST
            <select
              value={input.dstChoice}
              onChange={(e) =>
                update("dstChoice", e.target.value as BirthInput["dstChoice"])
              }
            >
              <option value="reject">Попросить уточнение</option>
              <option value="earlier">Первое вхождение</option>
              <option value="later">Второе вхождение</option>
            </select>
          </label>
        </div>
        <p>
          Часовой пояс и координаты подставляются при выборе города. Среднее
          солнечное время учитывает долготу, но не уравнение времени.
        </p>
      </details>
      <button className="button primary" type="submit" disabled={!placeReady}>
        {label} <span aria-hidden>↗</span>
      </button>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
