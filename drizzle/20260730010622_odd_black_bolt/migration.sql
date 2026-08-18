CREATE TYPE "customer_review_status" AS ENUM('draft', 'approved', 'rejected');--> statement-breakpoint
ALTER TABLE "customer_reviews" ADD COLUMN "status" "customer_review_status" DEFAULT 'draft'::"customer_review_status" NOT NULL;--> statement-breakpoint
UPDATE "customer_reviews" SET "status" = 'approved'::"customer_review_status" WHERE "is_approved" = true;--> statement-breakpoint
ALTER TABLE "customer_reviews" ADD COLUMN "image_keys_json" text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE "customer_reviews" ADD COLUMN "image_urls_json" text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE "customer_reviews" ALTER COLUMN "is_approved" SET DEFAULT false;
