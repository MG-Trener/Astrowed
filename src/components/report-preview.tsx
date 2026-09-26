"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Chart } from "@/domain/bazi/types";
import {
  reportHtml,
  reportLevels,
  type ReportLevel,
} from "@/services/report-template";
import { reportArtwork } from "@/assets/report-artwork";
import type { Conclusion } from "@/domain/bazi/reading";
export function ReportPreview({
  chart,
  conclusion,
}: {
  chart: Chart;
  conclusion?: Conclusion;
}) {
  const [level, setLevel] = useState<ReportLevel>("full"),
    [comment, setComment] = useState("");
  const [date, setDate] = useState("2026-09-25"),
    [ready, setReady] = useState(false);
  const iframe = useRef<HTMLIFrameElement>(null);
  useEffect(() => setDate(new Date().toISOString().slice(0, 10)), []);
  const html = useMemo(
    () =>
      reportHtml(chart, {
        level,
        comment,
        date,
        artwork: reportArtwork,
        conclusion,
      }),
    [chart, level, comment, date, conclusion],
  );
  useEffect(() => {
    // The server-rendered iframe may finish before React attaches onLoad.
    const frame = iframe.current;
    const sync = () =>
      setReady(frame?.contentDocument?.readyState === "complete");
    sync();
    frame?.addEventListener("load", sync);
    return () => frame?.removeEventListener("load", sync);
  }, [html]);
  function print() {
    iframe.current?.contentWindow?.focus();
    iframe.current?.contentWindow?.print();
  }
  return (
    <div className="report-preview">
      <div className="report-controls no-print">
        <div className="chip-row" aria-label="Формат отчёта">
          {Object.entries(reportLevels).map(([id, label]) => (
            <button
              key={id}
              className="chip"
              aria-pressed={level === id}
              onClick={() => setLevel(id as ReportLevel)}
            >
              {label}
            </button>
          ))}
        </div>
        <p>
          {level === "brief"
            ? "Карта, понятное объяснение главного и такты."
            : level === "full"
              ? "Понятный разбор, черновик заключения, Ба Цзы, звёзды, Гуа, Ци Мэнь и ближайшие десять лет."
              : "Все разделы, скрытые стволы, методика и таблица ста лет жизни."}
        </p>
        <label className="field">
          Комментарий консультанта (необязательно)
          <textarea
            rows={3}
            maxLength={5000}
            value={comment}
            placeholder="Добавьте собственное заключение для включения в отчёт"
            onChange={(e) => setComment(e.target.value)}
          />
        </label>
        <button
          type="button"
          className="button primary"
          disabled={!ready}
          onClick={print}
        >
          Печать / сохранить PDF ↓
        </button>
        <p className="distribution-note">
          В меню печати выберите «Сохранить как PDF» и включите фоновую графику.
          Текст комментария остаётся в этой вкладке и не сохраняется в базу.
        </p>
      </div>
      <iframe
        className="report-frame"
        ref={iframe}
        title={`${reportLevels[level]} отчёт Astrowed`}
        srcDoc={html}
        sandbox="allow-same-origin allow-modals"
        onLoad={() => setReady(true)}
      />
    </div>
  );
}
