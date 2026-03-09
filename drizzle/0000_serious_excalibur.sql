CREATE TYPE "public"."offer_status" AS ENUM('draft', 'applied', 'interview', 'offer', 'rejected', 'accepted');--> statement-breakpoint
CREATE TABLE "offers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company" text NOT NULL,
	"role" text NOT NULL,
	"status" "offer_status" DEFAULT 'draft' NOT NULL,
	"link" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
