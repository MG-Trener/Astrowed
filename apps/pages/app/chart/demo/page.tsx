import { calculate, demoInput } from "@/domain/bazi/engine";
import { ChartView } from "@/components/chart-view";
export const metadata = { title: "Демонстрационная карта" };
export default function Page() {
  return <ChartView chart={calculate(demoInput)} demo browserOnly />;
}
