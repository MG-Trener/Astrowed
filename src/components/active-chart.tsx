"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import type { Chart } from "@/domain/bazi/types";
import { chartSessionKey, restoreChart } from "@/domain/bazi/session";

const Context = createContext<{
  chart: Chart | null;
  ready: boolean;
  remember: (chart: Chart) => void;
}>({ chart: null, ready: false, remember: () => {} });
export function ActiveChartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [chart, setChart] = useState<Chart | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      setChart(restoreChart(sessionStorage.getItem(chartSessionKey)));
    } catch {
      /* In-memory use remains available. */
    }
    setReady(true);
  }, []);
  const remember = useCallback((next: Chart) => {
    setChart(next);
    try {
      sessionStorage.setItem(chartSessionKey, JSON.stringify(next.input));
    } catch {
      /* Keep the result for this visit. */
    }
  }, []);
  return (
    <Context.Provider value={{ chart, ready, remember }}>
      {children}
    </Context.Provider>
  );
}
export const useActiveChart = () => useContext(Context);
export function NoActiveChart() {
  const { ready } = useActiveChart();
  return (
    <div className="empty-state">
      <h2>
        {ready ? "Сначала рассчитайте свою карту" : "Загрузка вашей карты…"}
      </h2>
      <p>Здесь будут данные вашей даты рождения, периоды и личный разбор.</p>
      {ready && (
        <Link className="button primary" href="/calculator">
          Ввести данные ↗
        </Link>
      )}
    </div>
  );
}
