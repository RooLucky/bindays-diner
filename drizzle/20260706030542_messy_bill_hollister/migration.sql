CREATE TYPE "loyalty_redemption_source" AS ENUM('admin', 'system');--> statement-breakpoint
CREATE TYPE "loyalty_stamp_source" AS ENUM('online', 'physical', 'manual');--> statement-breakpoint
CREATE TABLE "loyalty_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"member_code" varchar(32) NOT NULL,
	"qr_token" varchar(64) NOT NULL,
	"full_name" varchar(160) NOT NULL,
	"normalized_name" varchar(160) NOT NULL,
	"birthday" varchar(10) NOT NULL,
	"phone" varchar(40),
	"normalized_phone" varchar(40),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "loyalty_redemptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"member_id" uuid NOT NULL,
	"reward_cycle" integer DEFAULT 1 NOT NULL,
	"source" "loyalty_redemption_source" DEFAULT 'admin'::"loyalty_redemption_source" NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "loyalty_stamps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"member_id" uuid NOT NULL,
	"reward_cycle" integer DEFAULT 1 NOT NULL,
	"stamp_number" integer NOT NULL,
	"source" "loyalty_stamp_source" DEFAULT 'physical'::"loyalty_stamp_source" NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "loyalty_members_member_code_idx" ON "loyalty_members" ("member_code");--> statement-breakpoint
CREATE UNIQUE INDEX "loyalty_members_qr_token_idx" ON "loyalty_members" ("qr_token");--> statement-breakpoint
CREATE UNIQUE INDEX "loyalty_members_phone_idx" ON "loyalty_members" ("normalized_phone");--> statement-breakpoint
CREATE UNIQUE INDEX "loyalty_stamps_member_cycle_number_idx" ON "loyalty_stamps" ("member_id","reward_cycle","stamp_number");--> statement-breakpoint
ALTER TABLE "loyalty_redemptions" ADD CONSTRAINT "loyalty_redemptions_member_id_loyalty_members_id_fkey" FOREIGN KEY ("member_id") REFERENCES "loyalty_members"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "loyalty_stamps" ADD CONSTRAINT "loyalty_stamps_member_id_loyalty_members_id_fkey" FOREIGN KEY ("member_id") REFERENCES "loyalty_members"("id") ON DELETE CASCADE;