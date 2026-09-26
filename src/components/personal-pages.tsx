"use client";
import Link from "next/link";
import { useActiveChart, NoActiveChart } from "./active-chart";
import { ChartView } from "./chart-view";
import { ExtendedChart } from "./extended-chart";
import { ReportPreview } from "./report-preview";

export function PersonalChartPage({
  browserOnly = false,
}: {
  browserOnly?: boolean;
}) {
  const { chart } = useActiveChart();
  return chart ? (
    <ChartView
      key={JSON.stringify(chart.input)}
      chart={chart}
      browserOnly={browserOnly}
    />
  ) : (
    <div className="page-wrap">
      <NoActiveChart />
    </div>
  );
}
export function PersonalSection({ tab }: { tab: string }) {
  const { chart } = useActiveChart();
  if (!chart) return <NoActiveChart />;
  return (
    <>
      <p className="active-chart-caption">
        {chart.input.name} · {chart.input.date} ·{" "}
        {chart.input.unknownTime ? "время неизвестно" : chart.input.time} ·{" "}
        {chart.input.city} <Link href="/calculator">Изменить →</Link>
      </p>
      <ExtendedChart
        key={JSON.stringify(chart.input) + tab}
        chart={chart}
        initial={tab}
        standalone
      />
    </>
  );
}
export function PersonalReport() {
  const { chart } = useActiveChart();
  return chart ? (
    <>
      <p className="active-chart-caption">
        {chart.input.name} · {chart.input.date} · {chart.input.city}
      </p>
      <ReportPreview key={JSON.stringify(chart.input)} chart={chart} />
    </>
  ) : (
    <NoActiveChart />
  );
}
