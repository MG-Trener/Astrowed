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
  clear: () => void;
  resetVersion: number;
}>({
  chart: null,
  ready: false,
  remember: () => {},
  clear: () => {},
  resetVersion: 0,
});
export function ActiveChartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [chart, setChart] = useState<Chart | null>(null);
  const [ready, setReady] = useState(false);
  const [resetVersion, setResetVersion] = useState(0);
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
  const clear = useCallback(() => {
    setChart(null);
    setResetVersion((version) => version + 1);
    try {
      sessionStorage.removeItem(chartSessionKey);
    } catch {
      /* In-memory reset remains available. */
    }
  }, []);
  return (
    <Context.Provider value={{ chart, ready, remember, clear, resetVersion }}>
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
