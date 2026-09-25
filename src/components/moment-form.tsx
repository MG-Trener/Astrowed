"use client";
import { LocationPicker } from "./location-picker";
import { useEffect, useRef, useState } from "react";
import { newBirthSchema } from "@/domain/bazi/engine";
import { emptyBirthInput } from "@/domain/bazi/session";
import { useActiveChart } from "./active-chart";
import type { BirthInput } from "@/domain/bazi/types";

export function MomentForm({
  onCalculate,
  children,
  label = "Построить карту",
  gender = false,
}: {
  onCalculate: (input: BirthInput) => void;
  children?: React.ReactNode;
  label?: string;
  gender?: boolean;
}) {
  const [input, setInput] = useState<BirthInput>({
    ...emptyBirthInput,
    name: gender ? "Расчёт Гуа" : "Карта момента",
  });
  const { chart, ready } = useActiveChart();
  const restored = useRef(false);
  const [placeReady, setPlaceReady] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!ready || restored.current) return;
    restored.current = true;
    if (chart) {
      setInput({
        ...chart.input,
        unknownTime: gender && chart.input.unknownTime,
        time: !gender && chart.input.unknownTime ? "" : chart.input.time,
      });
      setPlaceReady(true);
    }
  }, [chart, ready, gender]);
  const update = <K extends keyof BirthInput>(key: K, value: BirthInput[K]) =>
    setInput((s) => ({ ...s, [key]: value }));
  return (
    <form
      className="moment-form moment-compact"
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
          onCalculate(
            newBirthSchema.parse({
              ...input,
              time: input.unknownTime ? "12:00" : input.time,
            }),
          );
        } catch (e) {
          setError(e instanceof Error ? e.message : "Проверьте данные.");
        }
      }}
    >
      <div className="form-grid">
        <label className="field">
          {gender ? "Дата рождения" : "Дата события / рождения"}
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
            required={!input.unknownTime}
            disabled={input.unknownTime}
            type="time"
            value={input.unknownTime ? "" : input.time}
            onChange={(e) => update("time", e.target.value)}
          />
        </label>
        {gender && (
          <>
            <label className="field">
              Пол для Гуа
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
            <label className="checkbox">
              <input
                type="checkbox"
                checked={input.unknownTime}
                onChange={(e) => update("unknownTime", e.target.checked)}
              />
              Время неизвестно
            </label>
          </>
        )}
        {children}
      </div>
      <LocationPicker
        compact
        value={input}
        date={input.date}
        time={input.time}
        onChange={(place) => setInput((s) => ({ ...s, ...place }))}
        onReady={setPlaceReady}
      />
      <p className="method-note">
        Среднее солнечное время · поправки автоматически.
      </p>
      {error.includes("дважды") && (
        <label className="field">
          Повторившийся час
          <select
            value={input.dstChoice}
            onChange={(e) =>
              update("dstChoice", e.target.value as BirthInput["dstChoice"])
            }
          >
            <option value="reject">Уточните вхождение</option>
            <option value="earlier">Первое — до перевода часов</option>
            <option value="later">Второе — после перевода часов</option>
          </select>
        </label>
      )}
      {error && (
        <p className="error" role="alert">
          {error.includes("дважды")
            ? "Время повторилось при переводе часов. Выберите вхождение выше."
            : error}
        </p>
      )}
      <button className="button primary" type="submit" disabled={!placeReady}>
        {label} <span aria-hidden>↗</span>
      </button>
    </form>
  );
}
