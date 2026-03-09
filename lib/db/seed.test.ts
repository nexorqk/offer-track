import { describe, expect, it } from "vitest"

import { buildSeedPlan, DEMO_SEED_EMAIL } from "@/lib/db/seed"

describe("database seed plan", () => {
  it("builds a deterministic demo dataset", async () => {
    const first = await buildSeedPlan()
    const second = await buildSeedPlan()

    expect(first).toEqual(second)
    expect(first.account.email).toBe(DEMO_SEED_EMAIL)
    expect(first.account.fullName).toBe("Demo Candidate")
    expect(first.account.password).toBe("DemoPass123!")
  })

  it("includes the expected domain coverage", async () => {
    const plan = await buildSeedPlan()

    expect(plan.users).toHaveLength(1)
    expect(plan.profiles).toHaveLength(1)
    expect(plan.companies).toHaveLength(3)
    expect(plan.jobs).toHaveLength(4)
    expect(plan.contacts).toHaveLength(4)
    expect(plan.notes).toHaveLength(5)
    expect(plan.interviews).toHaveLength(3)
    expect(plan.tasks).toHaveLength(5)
    expect(plan.jobStageHistory).toHaveLength(11)
  })

  it("keeps all foreign-key references internally consistent", async () => {
    const plan = await buildSeedPlan()
    const userIds = new Set(plan.users.map((user) => user.id))
    const profileIds = new Set(plan.profiles.map((profile) => profile.id))
    const companyIds = new Set(plan.companies.map((company) => company.id))
    const jobIds = new Set(plan.jobs.map((job) => job.id))

    for (const profile of plan.profiles) {
      expect(userIds.has(profile.id)).toBe(true)
    }

    for (const company of plan.companies) {
      expect(profileIds.has(company.userId)).toBe(true)
    }

    for (const job of plan.jobs) {
      expect(profileIds.has(job.userId)).toBe(true)
      expect(companyIds.has(job.companyId)).toBe(true)
    }

    for (const stage of plan.jobStageHistory) {
      expect(jobIds.has(stage.jobId)).toBe(true)
    }

    for (const contact of plan.contacts) {
      expect(profileIds.has(contact.userId)).toBe(true)
      expect(companyIds.has(contact.companyId)).toBe(true)

      if (contact.jobId) {
        expect(jobIds.has(contact.jobId)).toBe(true)
      }
    }

    for (const note of plan.notes) {
      expect(profileIds.has(note.userId)).toBe(true)
      expect(jobIds.has(note.jobId)).toBe(true)
    }

    for (const interview of plan.interviews) {
      expect(jobIds.has(interview.jobId)).toBe(true)
    }

    for (const task of plan.tasks) {
      expect(profileIds.has(task.userId)).toBe(true)
      expect(jobIds.has(task.jobId)).toBe(true)
    }
  })

  it("covers the active job pipeline stages", async () => {
    const plan = await buildSeedPlan()

    expect(plan.jobs.map((job) => job.status)).toEqual([
      "applied",
      "technical",
      "offer",
      "wishlist",
    ])
    expect(plan.jobStageHistory.map((entry) => entry.toStatus)).toEqual([
      "wishlist",
      "applied",
      "wishlist",
      "applied",
      "hr_screen",
      "technical",
      "wishlist",
      "applied",
      "hr_screen",
      "technical",
      "offer",
    ])
  })
})
