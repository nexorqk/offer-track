CREATE TYPE "public"."note_kind" AS ENUM('internal', 'reflection', 'update');--> statement-breakpoint
CREATE TYPE "public"."visibility_profile" AS ENUM('private', 'shared', 'public_showcase');--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "public_id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "visibility_profile" "visibility_profile" DEFAULT 'private' NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "public_summary" text;--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "note_kind" "note_kind" DEFAULT 'internal' NOT NULL;--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "visibility_profile" "visibility_profile" DEFAULT 'private' NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "showcase_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "showcase_slug" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "showcase_title" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "showcase_intro" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "showcase_bio" text;--> statement-breakpoint
CREATE UNIQUE INDEX "jobs_public_id_idx" ON "jobs" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX "jobs_visibility_profile_idx" ON "jobs" USING btree ("visibility_profile");--> statement-breakpoint
CREATE INDEX "notes_visibility_profile_idx" ON "notes" USING btree ("visibility_profile");--> statement-breakpoint
CREATE UNIQUE INDEX "profiles_showcase_slug_idx" ON "profiles" USING btree ("showcase_slug");