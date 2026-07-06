CREATE TYPE "admin_account_role" AS ENUM('owner', 'admin');--> statement-breakpoint
CREATE TABLE "admin_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"full_name" varchar(160) NOT NULL,
	"role" "admin_account_role" DEFAULT 'admin'::"admin_account_role" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "admin_accounts_email_idx" ON "admin_accounts" ("email");