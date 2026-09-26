"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { QimenChart } from "@/domain/qimen/engine";
import { qimenPrintSvg, qimenPdfBlob } from "@/services/qimen-print";
import styles from "./qimen-print-preview.module.css";
import { inlineQimenArtwork } from "@/assets/report-artwork";
import type { ReportArtwork } from "@/services/report-artwork-files";

export function QimenPrintPreview({
  chart,
  onClose,
}: {
  chart: QimenChart;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [artwork, setArtwork] = useState<ReportArtwork | null>(null);
  useEffect(() => {
    let active = true;
    inlineQimenArtwork()
      .then((images) => {
        if (active) {
          setReady(false);
          setArtwork(images);
        }
      })
      .catch(() => {
        if (active) {
          setArtwork({});
          setError(
            "Иллюстрации не загрузились. Данные карты доступны; откройте предпросмотр повторно, чтобы загрузить оформление.",
          );
        }
      });
    return () => {
      active = false;
    };
  }, []);
  const src = useMemo(
    () =>
      "data:image/svg+xml;charset=utf-8," +
      encodeURIComponent(qimenPrintSvg(chart, artwork ?? {})),
    [chart, artwork],
  );
  useEffect(() => {
    const modal = dialog.current;
    modal?.showModal();
    return () => modal?.close();
  }, []);

  async function download() {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const url = URL.createObjectURL(await qimenPdfBlob(src));
      const link = document.createElement("a");
      link.href = url;
      link.download = `astrowed-qimen-${chart.input.date}-${chart.input.time.replace(":", "")}.pdf`;
      document.body.append(link);
      link.click();
      link.remove();
      // Keep the URL alive long enough for browsers to finish starting the download.
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      setMessage("PDF подготовлен. Откройте скачанный файл для печати.");
    } catch {
      setError(
        "Не удалось сохранить PDF. Попробуйте ещё раз или воспользуйтесь печатью.",
      );
    } finally {
      setSaving(false);
    }
  }

  function print() {
    setError("");
    setMessage(
      "Если окно печати не появилось, скачайте PDF и распечатайте его из программы просмотра.",
    );
    try {
      window.print();
    } catch {
      setError(
        "Этот браузер не открыл печать. Скачайте PDF для печати из файла.",
      );
    }
  }

  return createPortal(
    <dialog
      ref={dialog}
      className={styles.dialog}
      aria-labelledby="qimen-print-title"
      onCancel={onClose}
    >
      <header className={styles.controls}>
        <div className={styles.heading}>
          <div>
            <h2 id="qimen-print-title">Печать карты Ци Мэнь</h2>
            <p>А4 · один лист · все девять дворцов</p>
          </div>
          <button
            type="button"
            className="button"
            onClick={onClose}
            aria-label="Закрыть предпросмотр"
          >
            Закрыть ×
          </button>
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className="button primary"
            disabled={!ready || !artwork || saving}
            onClick={print}
          >
            Печать
          </button>
          <button
            type="button"
            className="button"
            disabled={!ready || !artwork || saving}
            onClick={download}
          >
            {saving ? "Готовим PDF…" : "Скачать PDF"}
          </button>
        </div>
        <p>
          PDF можно скачать напрямую, даже если браузер не открывает окно
          печати.
        </p>
        {!artwork && <p role="status">Загружаем оформление отчёта…</p>}
        <p role="status" aria-live="polite">
          {message}
        </p>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
      </header>
      {/* A standalone SVG keeps the printed sheet sharp and independent of responsive site styles. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={styles.sheet}
        src={src}
        width={794}
        height={1123}
        alt={`Печатная карта Ци Мэнь: ${chart.input.date}, ${chart.input.time}, ${chart.input.city}. Все девять дворцов, двери, звёзды, духи и стороны света.`}
        onLoad={() => setReady(true)}
        onError={() =>
          setError(
            "Не удалось загрузить печатный лист. Закройте предпросмотр и попробуйте снова.",
          )
        }
      />
    </dialog>,
    document.body,
  );
}
