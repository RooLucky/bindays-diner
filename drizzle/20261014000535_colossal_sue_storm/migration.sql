ALTER TABLE "management_items" ADD COLUMN IF NOT EXISTS "flavors" text[] DEFAULT '{}'::text[] NOT NULL;
