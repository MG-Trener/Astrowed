import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { ChartView } from "@/components/chart-view";
import { PersonalChartPage } from "@/components/personal-pages";
import { isAuthenticated } from "@/services/auth";
import { getDb } from "@/data/db";
import { charts } from "@/data/schema";
export const metadata = { title: "Матрица Ба Цзы" };
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (id === "demo" || id === "current") return <PersonalChartPage />;
  if (!(await isAuthenticated())) redirect("/login");
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [chart] = await getDb().select().from(charts).where(eq(charts.id, id));
  if (!chart) notFound();
  return <ChartView chart={chart.result} savedId={id} />;
}
