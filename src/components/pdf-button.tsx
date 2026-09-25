"use client";
import { useState } from "react";
export function PdfButton({ id }: { id: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function download() {
    setBusy(true);
    setError("");
    try {
      const r = await fetch(`/api/reports/${id}`, { method: "POST" });
      if (!r.ok) {
        const data = await r.json();
        throw new Error(data.error);
      }
      const url = URL.createObjectURL(await r.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = "astrowed-destiny-report.pdf";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка PDF.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="no-print">
      <button className="button primary" disabled={busy} onClick={download}>
        {busy ? "Формируем PDF…" : "Скачать отчёт PDF ↓"}
      </button>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
