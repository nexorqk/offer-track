CREATE OR REPLACE FUNCTION normalize_company_name_key(input_name text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT regexp_replace(lower(btrim(input_name)), '\s+', ' ', 'g')
$$;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "name_key" text;--> statement-breakpoint
UPDATE "companies"
SET "name_key" = normalize_company_name_key("name")
WHERE "name_key" IS NULL;--> statement-breakpoint
ALTER TABLE "companies" ALTER COLUMN "name_key" SET NOT NULL;--> statement-breakpoint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "companies"
    GROUP BY "user_id", "name_key"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Duplicate company names detected after normalization; resolve duplicates before applying the unique constraint.';
  END IF;
END
$$;--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_user_id_name_key_key" UNIQUE("user_id","name_key");--> statement-breakpoint
CREATE OR REPLACE FUNCTION sync_company_name_key()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW."name_key" := normalize_company_name_key(NEW."name");
  RETURN NEW;
END
$$;--> statement-breakpoint
CREATE OR REPLACE TRIGGER companies_sync_name_key_before_write
BEFORE INSERT OR UPDATE OF "name" ON "companies"
FOR EACH ROW
EXECUTE FUNCTION sync_company_name_key();--> statement-breakpoint
CREATE OR REPLACE FUNCTION validate_contact_scope()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  company_owner_id uuid;
  job_owner_id uuid;
  job_company_id uuid;
BEGIN
  SELECT "user_id"
  INTO company_owner_id
  FROM "companies"
  WHERE "id" = NEW."company_id";

  IF company_owner_id IS NOT NULL AND company_owner_id <> NEW."user_id" THEN
    RAISE EXCEPTION 'Contact company must belong to the same user.';
  END IF;

  IF NEW."job_id" IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT "company_id", "user_id"
  INTO job_company_id, job_owner_id
  FROM "jobs"
  WHERE "id" = NEW."job_id";

  IF job_owner_id IS NOT NULL AND job_owner_id <> NEW."user_id" THEN
    RAISE EXCEPTION 'Contact job must belong to the same user.';
  END IF;

  IF job_company_id IS NOT NULL AND job_company_id <> NEW."company_id" THEN
    RAISE EXCEPTION 'Contact company must match the linked job company.';
  END IF;

  RETURN NEW;
END
$$;--> statement-breakpoint
CREATE OR REPLACE TRIGGER contacts_validate_scope_before_write
BEFORE INSERT OR UPDATE OF "user_id", "company_id", "job_id" ON "contacts"
FOR EACH ROW
EXECUTE FUNCTION validate_contact_scope();--> statement-breakpoint
CREATE OR REPLACE FUNCTION record_job_status_history()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  effective_changed_at timestamp with time zone;
BEGIN
  effective_changed_at := CASE
    WHEN NEW."updated_at" IS DISTINCT FROM OLD."updated_at" THEN NEW."updated_at"
    ELSE now()
  END;

  INSERT INTO "job_stage_history" ("job_id", "from_status", "to_status", "changed_at")
  VALUES (NEW."id", OLD."status", NEW."status", effective_changed_at);

  RETURN NEW;
END
$$;--> statement-breakpoint
CREATE OR REPLACE TRIGGER jobs_record_status_history_after_update
AFTER UPDATE OF "status" ON "jobs"
FOR EACH ROW
WHEN (OLD."status" IS DISTINCT FROM NEW."status")
EXECUTE FUNCTION record_job_status_history();
