import { calculateNew } from "@/domain/bazi/engine";
import { ZodError } from "zod";
export async function POST(request: Request) {
  try {
    const text = await request.text();
    if (text.length > 8192)
      return Response.json(
        { error: "Слишком большой запрос." },
        { status: 413 },
      );
    return Response.json(calculateNew(JSON.parse(text)));
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof ZodError
            ? error.issues[0].message
            : error instanceof Error
              ? error.message
              : "Некорректные данные.",
      },
      { status: 400 },
    );
  }
}
