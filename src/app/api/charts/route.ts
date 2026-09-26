import { saveChart } from "@/services/chart-service";
import { checkOrigin, isAuthenticated } from "@/services/auth";
export async function POST(request: Request) {
  if (!(await isAuthenticated()))
    return Response.json(
      { error: "Войдите в кабинет консультанта, затем сохраните карту." },
      { status: 401 },
    );
  try {
    await checkOrigin();
    const text = await request.text();
    if (text.length > 8192)
      return Response.json(
        { error: "Слишком большой запрос." },
        { status: 413 },
      );
    const chart = await saveChart(JSON.parse(text));
    return Response.json(chart, { status: 201 });
  } catch {
    return Response.json(
      {
        error:
          "Не удалось сохранить карту. Проверьте данные и подключение к БД.",
      },
      { status: 400 },
    );
  }
}
