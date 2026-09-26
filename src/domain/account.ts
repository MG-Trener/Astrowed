import { z } from "zod";
import { DateTime } from "luxon";
import { birthSchema } from "./bazi/engine";

export const consentVersion = "2026-09-26";
export const profileSchema = z
  .object({
    name: z.string().trim().min(2, "Укажите имя").max(100),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[\d\s()\-]{7,25}$/, "Укажите телефон с кодом страны"),
    birth: birthSchema.nullable(),
    residence: z
      .object({
        city: z.string().trim().max(120),
        timezone: z.string().max(80),
        longitude: z.number().min(-180).max(180),
        latitude: z.number().min(-90).max(90),
      })
      .nullable(),
    privacyConsent: z.literal(true, {
      error: "Нужно согласие на обработку данных",
    }),
    termsConsent: z.literal(true, { error: "Примите условия использования" }),
    marketingConsent: z.boolean().default(false),
  })
  .strict()
  .superRefine((p, ctx) => {
    if (p.birth) {
      const date = DateTime.fromISO(p.birth.date, { zone: p.birth.timezone });
      if (
        !date.isValid ||
        date.year < 1901 ||
        date > DateTime.now().setZone(p.birth.timezone)
      )
        ctx.addIssue({
          code: "custom",
          path: ["birth", "date"],
          message: "Проверьте дату и часовой пояс рождения",
        });
    }
  });
export type ProfileInput = z.infer<typeof profileSchema>;
export type AccountProfile = ProfileInput & {
  consentVersion: string;
  userId: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};
export type AccountUser = {
  id: string;
  email: string;
  name: string;
  role: "client" | "admin" | "expert";
};
export type AccountState = {
  user: AccountUser;
  profile: AccountProfile | null;
};
export const calculatorNames = {
  bazi: "Ба Цзы",
  qimen: "Ци Мэнь",
  gua: "Гуа",
  calendar: "Китайский календарь",
  compass: "Компас",
} as const;
export type CalculatorKind = keyof typeof calculatorNames;
export function accountRole(
  email: string,
  verified: boolean,
): AccountUser["role"] {
  if (!verified) return "client";
  const normalized = email.trim().toLowerCase();
  return normalized === "mihagavr@gmail.com"
    ? "admin"
    : normalized === "kievica1989@mail.ru"
      ? "expert"
      : "client";
}
export function safeReturnPath(value: string | null) {
  return value &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !/[\\\r\n]/.test(value)
    ? value
    : "/account/";
}
