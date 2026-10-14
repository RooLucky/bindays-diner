CREATE TABLE IF NOT EXISTS "meal_flavors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(80) NOT NULL,
	"normalized_name" varchar(80) NOT NULL UNIQUE
);
--> statement-breakpoint
INSERT INTO meal_flavors (name, normalized_name)
SELECT min(trim(flavor)), lower(trim(flavor))
FROM management_items CROSS JOIN LATERAL unnest(flavors) AS flavor
WHERE category_slug = 'student-meal' AND trim(flavor) <> ''
GROUP BY lower(trim(flavor))
ON CONFLICT (normalized_name) DO NOTHING;
