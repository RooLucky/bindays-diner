CREATE TABLE "customer_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"full_name" varchar(160) NOT NULL,
	"rating" integer NOT NULL,
	"comment" text NOT NULL,
	"favorite_item" varchar(120),
	"is_approved" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "google_review_cache" (
	"place_id" varchar(160) PRIMARY KEY,
	"rating" varchar(16),
	"user_rating_count" integer,
	"google_maps_url" text,
	"reviews_json" text DEFAULT '[]' NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "customer_reviews_approved_created_idx" ON "customer_reviews" ("is_approved","created_at");