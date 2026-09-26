CREATE TABLE "astrowed"."calculation_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"kind" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "astrowed"."member_consents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"version" text NOT NULL,
	"privacy" boolean NOT NULL,
	"terms" boolean NOT NULL,
	"marketing" boolean NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "astrowed"."member_profiles" (
	"userId" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"birth" jsonb,
	"residence" jsonb,
	"privacyConsent" boolean NOT NULL,
	"termsConsent" boolean NOT NULL,
	"marketingConsent" boolean DEFAULT false NOT NULL,
	"consentVersion" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "astrowed"."member_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"message" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"snapshot" jsonb NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"sentAt" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "astrowed"."member_consents" ADD CONSTRAINT "member_consents_userId_member_profiles_userId_fk" FOREIGN KEY ("userId") REFERENCES "astrowed"."member_profiles"("userId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "astrowed"."member_requests" ADD CONSTRAINT "member_requests_userId_member_profiles_userId_fk" FOREIGN KEY ("userId") REFERENCES "astrowed"."member_profiles"("userId") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "calculation_events_date_idx" ON "astrowed"."calculation_events" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "calculation_events_user_idx" ON "astrowed"."calculation_events" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "member_requests_user_idx" ON "astrowed"."member_requests" USING btree ("userId");