ALTER TABLE "reservations" ADD COLUMN IF NOT EXISTS "delivery_city" varchar(80);--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN IF NOT EXISTS "delivery_fee" integer DEFAULT 0 NOT NULL;