CREATE TABLE "chatbot_knowledge_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"question" varchar(240) NOT NULL,
	"answer" text NOT NULL,
	"keywords" text DEFAULT '' NOT NULL,
	"category" varchar(80) DEFAULT 'General' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chatbot_rate_limits" (
	"key_hash" varchar(64) PRIMARY KEY,
	"request_count" integer DEFAULT 0 NOT NULL,
	"window_started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "chatbot_knowledge_question_idx" ON "chatbot_knowledge_entries" ("question");--> statement-breakpoint
CREATE INDEX "chatbot_knowledge_active_idx" ON "chatbot_knowledge_entries" ("is_active");