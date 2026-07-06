CREATE TABLE "admin_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"admin_account_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "management_categories" (
	"slug" varchar(80) PRIMARY KEY,
	"eyebrow" varchar(120) NOT NULL,
	"title" varchar(220) NOT NULL,
	"description" text NOT NULL,
	"cta_label" varchar(120) NOT NULL,
	"cta_href" varchar(220) NOT NULL,
	"hero_image_key" text,
	"hero_image_url" text NOT NULL,
	"hero_alt" varchar(220) NOT NULL,
	"badge" varchar(80),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "management_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"category_slug" varchar(80) NOT NULL,
	"name" varchar(160) NOT NULL,
	"description" text NOT NULL,
	"price" varchar(40) NOT NULL,
	"tag" varchar(80),
	"image_key" text,
	"image_url" text NOT NULL,
	"image_alt" varchar(220) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "admin_sessions_token_hash_idx" ON "admin_sessions" ("token_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "management_items_category_name_idx" ON "management_items" ("category_slug","name");--> statement-breakpoint
ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_admin_account_id_admin_accounts_id_fkey" FOREIGN KEY ("admin_account_id") REFERENCES "admin_accounts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "management_items" ADD CONSTRAINT "management_items_category_slug_management_categories_slug_fkey" FOREIGN KEY ("category_slug") REFERENCES "management_categories"("slug") ON DELETE CASCADE;