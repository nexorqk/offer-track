import { Client } from "pg"

import { buildSeedPlan } from "../lib/db/seed.ts"

function needsSsl(connectionString) {
  const host = new URL(connectionString).hostname

  if (host === "localhost" || host === "127.0.0.1") {
    return false
  }

  return !host.endsWith(".railway.internal")
}

function getDatabaseConfig(connectionString) {
  const parsed = new URL(connectionString)

  return {
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 5432,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.slice(1),
    ssl: needsSsl(connectionString) ? { rejectUnauthorized: false } : false,
  }
}

async function insertRows(client, tableName, columns, rows) {
  if (rows.length === 0) {
    return
  }

  const values = []
  const placeholders = rows.map((row) => {
    const rowPlaceholders = columns.map(({ key }) => {
      values.push(row[key])

      return `$${values.length}`
    })

    return `(${rowPlaceholders.join(", ")})`
  })

  const quotedColumns = columns.map(({ column }) => `"${column}"`).join(", ")
  const query = `insert into "${tableName}" (${quotedColumns}) values ${placeholders.join(", ")}`

  await client.query(query, values)
}

async function main() {
  const connectionString =
    process.env.DRIZZLE_DATABASE_URL ?? process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error("Missing DATABASE_URL or DRIZZLE_DATABASE_URL.")
  }

  const plan = await buildSeedPlan()
  const client = new Client(getDatabaseConfig(connectionString))

  await client.connect()

  try {
    await client.query("begin")
    await client.query("delete from users where email = $1", [plan.account.email])

    await insertRows(
      client,
      "users",
      [
        { column: "id", key: "id" },
        { column: "email", key: "email" },
        { column: "password_hash", key: "passwordHash" },
        { column: "created_at", key: "createdAt" },
        { column: "updated_at", key: "updatedAt" },
      ],
      plan.users,
    )
    await insertRows(
      client,
      "profiles",
      [
        { column: "id", key: "id" },
        { column: "email", key: "email" },
        { column: "full_name", key: "fullName" },
        { column: "avatar_url", key: "avatarUrl" },
        { column: "created_at", key: "createdAt" },
      ],
      plan.profiles,
    )
    await insertRows(
      client,
      "companies",
      [
        { column: "id", key: "id" },
        { column: "user_id", key: "userId" },
        { column: "name", key: "name" },
        { column: "website", key: "website" },
        { column: "location", key: "location" },
        { column: "industry", key: "industry" },
        { column: "notes", key: "notes" },
        { column: "created_at", key: "createdAt" },
        { column: "updated_at", key: "updatedAt" },
      ],
      plan.companies,
    )
    await insertRows(
      client,
      "jobs",
      [
        { column: "id", key: "id" },
        { column: "user_id", key: "userId" },
        { column: "company_id", key: "companyId" },
        { column: "title", key: "title" },
        { column: "source", key: "source" },
        { column: "source_url", key: "sourceUrl" },
        { column: "location", key: "location" },
        { column: "employment_type", key: "employmentType" },
        { column: "work_mode", key: "workMode" },
        { column: "salary_min", key: "salaryMin" },
        { column: "salary_max", key: "salaryMax" },
        { column: "currency", key: "currency" },
        { column: "status", key: "status" },
        { column: "priority", key: "priority" },
        { column: "applied_at", key: "appliedAt" },
        { column: "description", key: "description" },
        { column: "created_at", key: "createdAt" },
        { column: "updated_at", key: "updatedAt" },
      ],
      plan.jobs,
    )
    await insertRows(
      client,
      "job_stage_history",
      [
        { column: "id", key: "id" },
        { column: "job_id", key: "jobId" },
        { column: "from_status", key: "fromStatus" },
        { column: "to_status", key: "toStatus" },
        { column: "changed_at", key: "changedAt" },
      ],
      plan.jobStageHistory,
    )
    await insertRows(
      client,
      "contacts",
      [
        { column: "id", key: "id" },
        { column: "user_id", key: "userId" },
        { column: "company_id", key: "companyId" },
        { column: "job_id", key: "jobId" },
        { column: "name", key: "name" },
        { column: "role", key: "role" },
        { column: "email", key: "email" },
        { column: "linkedin_url", key: "linkedinUrl" },
        { column: "notes", key: "notes" },
        { column: "created_at", key: "createdAt" },
        { column: "updated_at", key: "updatedAt" },
      ],
      plan.contacts,
    )
    await insertRows(
      client,
      "notes",
      [
        { column: "id", key: "id" },
        { column: "user_id", key: "userId" },
        { column: "job_id", key: "jobId" },
        { column: "content", key: "content" },
        { column: "created_at", key: "createdAt" },
        { column: "updated_at", key: "updatedAt" },
      ],
      plan.notes,
    )
    await insertRows(
      client,
      "interviews",
      [
        { column: "id", key: "id" },
        { column: "job_id", key: "jobId" },
        { column: "type", key: "type" },
        { column: "scheduled_at", key: "scheduledAt" },
        { column: "duration_minutes", key: "durationMinutes" },
        { column: "location", key: "location" },
        { column: "result", key: "result" },
        { column: "notes", key: "notes" },
        { column: "created_at", key: "createdAt" },
        { column: "updated_at", key: "updatedAt" },
      ],
      plan.interviews,
    )
    await insertRows(
      client,
      "tasks",
      [
        { column: "id", key: "id" },
        { column: "user_id", key: "userId" },
        { column: "job_id", key: "jobId" },
        { column: "title", key: "title" },
        { column: "due_date", key: "dueDate" },
        { column: "completed", key: "completed" },
        { column: "created_at", key: "createdAt" },
        { column: "updated_at", key: "updatedAt" },
      ],
      plan.tasks,
    )
    await client.query("commit")

    console.log(
      `Seeded demo data for ${plan.account.email}: ${plan.companies.length} companies, ${plan.jobs.length} jobs, ${plan.tasks.length} tasks.`,
    )
  } catch (error) {
    await client.query("rollback")
    throw error
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
