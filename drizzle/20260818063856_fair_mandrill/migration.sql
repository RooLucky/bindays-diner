CREATE TYPE "reservation_payment_status" AS ENUM('pending', 'unpaid', 'paid');--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"full_name" varchar(160) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(40) NOT NULL,
	"delivery_address" text NOT NULL,
	"landmark" text,
	"delivery_date" varchar(10) NOT NULL,
	"delivery_time" varchar(5) NOT NULL,
	"notes" text,
	"items_json" text NOT NULL,
	"subtotal" integer NOT NULL,
	"payment_status" "reservation_payment_status" DEFAULT 'pending'::"reservation_payment_status" NOT NULL,
	"payment_token" varchar(64) NOT NULL,
	"payment_link_expires_at" timestamp with time zone NOT NULL,
	"receipt_key" text,
	"receipt_url" text,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "reservations_payment_token_idx" ON "reservations" ("payment_token");--> statement-breakpoint
CREATE INDEX "reservations_payment_status_expiry_idx" ON "reservations" ("payment_status","payment_link_expires_at");