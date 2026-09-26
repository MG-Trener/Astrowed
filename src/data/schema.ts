import {
  pgSchema,
  uuid,
  text,
  timestamp,
  date,
  boolean,
  jsonb,
  doublePrecision,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { Chart, BirthInput } from "../domain/bazi/types";
export const appSchema = pgSchema("astrowed");
// Managed identity remains in neon_auth; these tables contain application data only.
export const memberProfiles = appSchema
  .table("member_profiles", {
    userId: text().primaryKey(),
    email: text().notNull(),
    name: text().notNull(),
    phone: text().notNull(),
    birth: jsonb().$type<BirthInput | null>(),
    residence: jsonb().$type<{
      city: string;
      timezone: string;
      longitude: number;
      latitude: number;
    } | null>(),
    privacyConsent: boolean().notNull(),
    termsConsent: boolean().notNull(),
    marketingConsent: boolean().notNull().default(false),
    consentVersion: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  })
  .enableRLS();
export const memberConsents = appSchema
  .table("member_consents", {
    id: uuid().defaultRandom().primaryKey(),
    userId: text()
      .notNull()
      .references(() => memberProfiles.userId, { onDelete: "cascade" }),
    version: text().notNull(),
    privacy: boolean().notNull(),
    terms: boolean().notNull(),
    marketing: boolean().notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  })
  .enableRLS();
export const calculationEvents = appSchema
  .table(
    "calculation_events",
    {
      id: uuid().defaultRandom().primaryKey(),
      userId: text().notNull(),
      kind: text().notNull(),
      createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    },
    (t) => [
      index("calculation_events_date_idx").on(t.createdAt),
      index("calculation_events_user_idx").on(t.userId),
    ],
  )
  .enableRLS();
export const memberRequests = appSchema
  .table(
    "member_requests",
    {
      id: uuid().defaultRandom().primaryKey(),
      userId: text()
        .notNull()
        .references(() => memberProfiles.userId, { onDelete: "cascade" }),
      message: text().notNull(),
      status: text().notNull().default("pending"),
      snapshot: jsonb().notNull(),
      createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
      sentAt: timestamp({ withTimezone: true }),
    },
    (t) => [index("member_requests_user_idx").on(t.userId)],
  )
  .enableRLS();
export const users = appSchema.table("users", {
  id: uuid().defaultRandom().primaryKey(),
  email: text().notNull().unique(),
  role: text().notNull().default("consultant"),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});
export const clients = appSchema.table("clients", {
  id: uuid().defaultRandom().primaryKey(),
  name: text().notNull(),
  email: text(),
  phone: text(),
  notes: text().notNull().default(""),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});
export const birthData = appSchema.table(
  "birth_data",
  {
    id: uuid().defaultRandom().primaryKey(),
    clientId: uuid()
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    birthDate: date().notNull(),
    birthTime: text(),
    unknownTime: boolean().default(false).notNull(),
    gender: text().notNull(),
    city: text().notNull(),
    timezone: text().notNull(),
    longitude: doublePrecision().notNull(),
    latitude: doublePrecision().notNull(),
  },
  (t) => [index("birth_client_idx").on(t.clientId)],
);
export const calculationMethods = appSchema.table("calculation_methods", {
  id: text().primaryKey(),
  version: text().notNull(),
  description: text().notNull(),
  config: jsonb().notNull(),
  requiresExpertReview: boolean().notNull().default(true),
});
export const charts = appSchema.table(
  "charts",
  {
    id: uuid().defaultRandom().primaryKey(),
    clientId: uuid()
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    birthDataId: uuid()
      .notNull()
      .references(() => birthData.id),
    title: text().notNull(),
    input: jsonb().$type<BirthInput>().notNull(),
    result: jsonb().$type<Chart>().notNull(),
    engineVersion: text().notNull(),
    methodId: text().notNull(),
    methodVersion: text().notNull(),
    timezoneVersion: text().notNull(),
    calculatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("chart_client_idx").on(t.clientId)],
);
export const consultations = appSchema.table(
  "consultations",
  {
    id: uuid().defaultRandom().primaryKey(),
    clientId: uuid()
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    chartId: uuid().references(() => charts.id),
    date: date().notNull(),
    topic: text().notNull(),
    notes: text().notNull().default(""),
    recommendations: text().notNull().default(""),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("consultation_client_idx").on(t.clientId)],
);
export const categories = appSchema.table("knowledge_categories", {
  id: text().primaryKey(),
  name: text().notNull(),
  position: integer().notNull().default(0),
});
export const articles = appSchema.table("knowledge_articles", {
  id: uuid().defaultRandom().primaryKey(),
  slug: text().notNull().unique(),
  categoryId: text().references(() => categories.id),
  title: text().notNull(),
  symbol: text(),
  summary: text().notNull(),
  body: text().notNull(),
  references: text().notNull().default(""),
  published: boolean().notNull().default(false),
  requiresExpertReview: boolean().notNull().default(true),
  updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});
export const knowledgeLinks = appSchema.table(
  "knowledge_links",
  {
    id: uuid().defaultRandom().primaryKey(),
    sourceId: uuid()
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    targetId: uuid()
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    relation: text().notNull(),
  },
  (t) => [
    uniqueIndex("knowledge_link_unique").on(t.sourceId, t.targetId, t.relation),
  ],
);
export const elementRecords = appSchema.table("elements", {
  id: text().primaryKey(),
  name: text().notNull(),
  symbol: text().notNull(),
  color: text().notNull(),
  position: integer().notNull(),
});
export const heavenlyStems = appSchema.table("heavenly_stems", {
  symbol: text().primaryKey(),
  elementId: text()
    .notNull()
    .references(() => elementRecords.id),
  polarity: text().notNull(),
  position: integer().notNull(),
});
export const earthlyBranches = appSchema.table("earthly_branches", {
  symbol: text().primaryKey(),
  animal: text().notNull(),
  position: integer().notNull(),
});
export const hiddenStems = appSchema.table(
  "hidden_stems",
  {
    id: uuid().defaultRandom().primaryKey(),
    branch: text()
      .notNull()
      .references(() => earthlyBranches.symbol),
    stem: text()
      .notNull()
      .references(() => heavenlyStems.symbol),
    position: integer().notNull(),
  },
  (t) => [uniqueIndex("hidden_stem_unique").on(t.branch, t.stem)],
);
export const tenGods = appSchema.table("ten_gods", {
  symbol: text().primaryKey(),
  name: text().notNull(),
  requiresExpertReview: boolean().notNull().default(true),
});
export const auditLogs = appSchema.table("audit_logs", {
  id: uuid().defaultRandom().primaryKey(),
  action: text().notNull(),
  entityId: uuid().notNull(),
  actor: text().notNull().default("consultant"),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});
