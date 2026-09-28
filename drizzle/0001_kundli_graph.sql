CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS "astro_nodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"attributes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"text" text NOT NULL,
	"embedding" vector(1536),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "astro_edges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from_id" uuid NOT NULL,
	"to_id" uuid NOT NULL,
	"relation" text NOT NULL,
	"attributes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "kundli_readings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"conversation_id" uuid,
	"encrypted_birth_data" text NOT NULL,
	"match_result" jsonb NOT NULL,
	"consent_given" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "astro_nodes_type_idx" ON "astro_nodes" ("type");
CREATE INDEX IF NOT EXISTS "astro_nodes_name_idx" ON "astro_nodes" ("name");
CREATE INDEX IF NOT EXISTS "astro_edges_from_idx" ON "astro_edges" ("from_id");
CREATE INDEX IF NOT EXISTS "astro_edges_to_idx" ON "astro_edges" ("to_id");
CREATE INDEX IF NOT EXISTS "kundli_readings_user_idx" ON "kundli_readings" ("user_id");
