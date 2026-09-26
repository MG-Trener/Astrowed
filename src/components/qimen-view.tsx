"use client";
import { useState } from "react";
import Link from "next/link";
import {
  calculateQimen,
  doorNames,
  type QimenChart,
} from "@/domain/qimen/engine";
import { MomentForm } from "./moment-form";
import { PalaceBoard } from "./palace-board";
import { QimenPrintPreview } from "./qimen-print-preview";
import { accountFetch } from "@/services/account-client";

// Keep the existing import contract for reports and other chart views.
export { PalaceBoard } from "./palace-board";

export function QimenView() {
  const [chart, setChart] = useState<QimenChart | null>(null);
  const [printOpen, setPrintOpen] = useState(false);
  const [system, setSystem] = useState<"chaibu" | "manual">("chaibu");
  const [ju, setJu] = useState(1);
  const [dun, setDun] = useState<"yang" | "yin">("yang");
  return (
    <div
      className={
        chart
          ? "page-wrap expansion-page"
          : "page-wrap calculator-compact compact-tool-page"
      }
    >
      <div className="page-title">
        <div>
          <h1>Ци Мэнь · девять дворцов</h1>
          <p>Укажите дату, время и место рождения или события.</p>
        </div>
      </div>
      {chart && (
        <button className="back-link" onClick={() => setChart(null)}>
          ← Изменить дату и место
        </button>
      )}
      <section id="qimen-calculator" hidden={Boolean(chart)}>
        <MomentForm
          onCalculate={async (input) =>
            setChart(await accountFetch<QimenChart>("/calculate", { kind: "qimen", input, options: { system, ju, dun } }))
          }
        >
          <label className="field full">
            Система
            <select
              value={system}
              onChange={(e) => setSystem(e.target.value as typeof system)}
            >
              <option value="chaibu">
                Часовая · Чай Бу · вращающийся диск
              </option>
              <option value="manual">Вращающийся диск · ручной цзюй</option>
            </select>
          </label>
          {system === "manual" && (
            <>
              <label className="field">
                Дунь
                <select
                  value={dun}
                  onChange={(e) => setDun(e.target.value as typeof dun)}
                >
                  <option value="yang">Ян Дунь</option>
                  <option value="yin">Инь Дунь</option>
                </select>
              </label>
              <label className="field">
                Цзюй
                <select
                  value={ju}
                  onChange={(e) => setJu(Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </label>
            </>
          )}
        </MomentForm>
      </section>
      {chart && (
        <section className="exp-section" aria-label="Результат Ци Мэнь">
          <div className="result-heading">
            <div>
              <div className="eyebrow">
                {chart.input.name} / {chart.localTime} · {chart.input.timezone}
              </div>
              <h2>
                {chart.dun === "yang" ? "Ян" : "Инь"} Дунь · {chart.ju} цзюй
              </h2>
              <p>
                {chart.term} · {chart.yuan} юань · {chart.pillars.join(" / ")}
              </p>
            </div>
            <button
              type="button"
              className="button no-print"
              onClick={() => setPrintOpen(true)}
            >
              Печать / PDF ↓
            </button>
          </div>
          <PalaceBoard
            key={`${chart.utc}-${chart.ju}-${chart.dun}`}
            chart={chart}
          />
          <p className="method-note">
            {chart.method}
            <br />
            Введённое время: {chart.input.date} {chart.input.time} · Среднее
            солнечное: {chart.localTime} · Поправка:{" "}
            {Math.round(chart.correctionMinutes * 100) / 100} мин.
            <br />
            Сюнь: {chart.xun} · скрытый Цзя: {chart.concealed} · Чжи Фу:{" "}
            {chart.dutyStar} → дворец {chart.starTarget} · Чжи Ши:{" "}
            {doorNames[chart.dutyDoor]} → дворец {chart.doorTarget}. UTC:{" "}
            {chart.utc}.
          </p>
        </section>
      )}
      {chart && printOpen && (
        <QimenPrintPreview chart={chart} onClose={() => setPrintOpen(false)} />
      )}
      <details className="compact-tool-help">
        <summary>Методика и справочник</summary>
        <p>
          Часовой вращающийся диск, Чай Бу. Среднее солнечное время; смена дня в
          00:00. Ручной цзюй доступен в поле «Система». Вводите местное время
          без ручных поправок.
        </p>
        <Link href="/qimen/palaces">Справочник девяти дворцов ↗</Link>
      </details>
    </div>
  );
}
