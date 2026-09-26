CREATE SCHEMA "astrowed";
--> statement-breakpoint
CREATE TABLE "astrowed"."knowledge_articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"categoryId" text,
	"title" text NOT NULL,
	"symbol" text,
	"summary" text NOT NULL,
	"body" text NOT NULL,
	"references" text DEFAULT '' NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"requiresExpertReview" boolean DEFAULT true NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "knowledge_articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "astrowed"."audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"action" text NOT NULL,
	"entityId" uuid NOT NULL,
	"actor" text DEFAULT 'consultant' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "astrowed"."birth_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clientId" uuid NOT NULL,
	"birthDate" date NOT NULL,
	"birthTime" text,
	"unknownTime" boolean DEFAULT false NOT NULL,
	"gender" text NOT NULL,
	"city" text NOT NULL,
	"timezone" text NOT NULL,
	"longitude" double precision NOT NULL,
	"latitude" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE "astrowed"."calculation_methods" (
	"id" text PRIMARY KEY NOT NULL,
	"version" text NOT NULL,
	"description" text NOT NULL,
	"config" jsonb NOT NULL,
	"requiresExpertReview" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "astrowed"."knowledge_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "astrowed"."charts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clientId" uuid NOT NULL,
	"birthDataId" uuid NOT NULL,
	"title" text NOT NULL,
	"input" jsonb NOT NULL,
	"result" jsonb NOT NULL,
	"engineVersion" text NOT NULL,
	"methodId" text NOT NULL,
	"methodVersion" text NOT NULL,
	"timezoneVersion" text NOT NULL,
	"calculatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "astrowed"."clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"notes" text DEFAULT '' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "astrowed"."consultations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clientId" uuid NOT NULL,
	"chartId" uuid,
	"date" date NOT NULL,
	"topic" text NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"recommendations" text DEFAULT '' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "astrowed"."earthly_branches" (
	"symbol" text PRIMARY KEY NOT NULL,
	"animal" text NOT NULL,
	"position" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "astrowed"."elements" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"symbol" text NOT NULL,
	"color" text NOT NULL,
	"position" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "astrowed"."heavenly_stems" (
	"symbol" text PRIMARY KEY NOT NULL,
	"elementId" text NOT NULL,
	"polarity" text NOT NULL,
	"position" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "astrowed"."hidden_stems" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"branch" text NOT NULL,
	"stem" text NOT NULL,
	"position" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "astrowed"."knowledge_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sourceId" uuid NOT NULL,
	"targetId" uuid NOT NULL,
	"relation" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "astrowed"."ten_gods" (
	"symbol" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"requiresExpertReview" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "astrowed"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"role" text DEFAULT 'consultant' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "astrowed"."knowledge_articles" ADD CONSTRAINT "knowledge_articles_categoryId_knowledge_categories_id_fk" FOREIGN KEY ("categoryId") REFERENCES "astrowed"."knowledge_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "astrowed"."birth_data" ADD CONSTRAINT "birth_data_clientId_clients_id_fk" FOREIGN KEY ("clientId") REFERENCES "astrowed"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "astrowed"."charts" ADD CONSTRAINT "charts_clientId_clients_id_fk" FOREIGN KEY ("clientId") REFERENCES "astrowed"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "astrowed"."charts" ADD CONSTRAINT "charts_birthDataId_birth_data_id_fk" FOREIGN KEY ("birthDataId") REFERENCES "astrowed"."birth_data"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "astrowed"."consultations" ADD CONSTRAINT "consultations_clientId_clients_id_fk" FOREIGN KEY ("clientId") REFERENCES "astrowed"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "astrowed"."consultations" ADD CONSTRAINT "consultations_chartId_charts_id_fk" FOREIGN KEY ("chartId") REFERENCES "astrowed"."charts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "astrowed"."heavenly_stems" ADD CONSTRAINT "heavenly_stems_elementId_elements_id_fk" FOREIGN KEY ("elementId") REFERENCES "astrowed"."elements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "astrowed"."hidden_stems" ADD CONSTRAINT "hidden_stems_branch_earthly_branches_symbol_fk" FOREIGN KEY ("branch") REFERENCES "astrowed"."earthly_branches"("symbol") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "astrowed"."hidden_stems" ADD CONSTRAINT "hidden_stems_stem_heavenly_stems_symbol_fk" FOREIGN KEY ("stem") REFERENCES "astrowed"."heavenly_stems"("symbol") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "astrowed"."knowledge_links" ADD CONSTRAINT "knowledge_links_sourceId_knowledge_articles_id_fk" FOREIGN KEY ("sourceId") REFERENCES "astrowed"."knowledge_articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "astrowed"."knowledge_links" ADD CONSTRAINT "knowledge_links_targetId_knowledge_articles_id_fk" FOREIGN KEY ("targetId") REFERENCES "astrowed"."knowledge_articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "birth_client_idx" ON "astrowed"."birth_data" USING btree ("clientId");--> statement-breakpoint
CREATE INDEX "chart_client_idx" ON "astrowed"."charts" USING btree ("clientId");--> statement-breakpoint
CREATE INDEX "consultation_client_idx" ON "astrowed"."consultations" USING btree ("clientId");--> statement-breakpoint
CREATE UNIQUE INDEX "hidden_stem_unique" ON "astrowed"."hidden_stems" USING btree ("branch","stem");--> statement-breakpoint
CREATE UNIQUE INDEX "knowledge_link_unique" ON "astrowed"."knowledge_links" USING btree ("sourceId","targetId","relation");