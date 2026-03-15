import { expect, test } from "@playwright/test"

test.describe("auth and notes smoke flow", () => {
  test("redirects unauthenticated users to login with the intended target", async ({
    page,
  }) => {
    await page.goto("/notes")

    await expect(page).toHaveURL(/\/login\?redirectTo=%2Fnotes$/)
    await expect(page.getByRole("heading", { name: "Log in" })).toBeVisible()
  })

  test("registers a new user, creates a note, and logs out", async ({ page }) => {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const email = `playwright-${uniqueId}@example.com`
    const password = `Smoke-${uniqueId}!`
    const title = `Playwright note ${uniqueId}`
    const content = "Verify the auth flow and save a reusable outreach draft."

    await page.goto("/register?redirectTo=/notes")

    await page.getByLabel("Email").fill(email)
    await page.getByLabel("Password", { exact: true }).fill(password)
    await page.getByLabel("Confirm password").fill(password)
    await page.getByRole("button", { name: "Create account" }).click()

    await expect(page).toHaveURL(/\/notes$/)
    await expect(
      page.getByRole("heading", { name: "Add a reusable text block" }),
    ).toBeVisible()

    await page.getByLabel("Title").fill(title)
    await page.getByLabel("Note text").fill(content)
    await page.getByRole("button", { name: "Save note" }).click()

    await expect(page.locator('input[name="title"]').last()).toHaveValue(title)
    await expect(page.locator('textarea[name="content"]').last()).toHaveValue(content)

    await page.getByRole("button", { name: "Log out" }).click()

    await expect(page).toHaveURL(/\/login$/)

    await page.goto("/notes")
    await expect(page).toHaveURL(/\/login\?redirectTo=%2Fnotes$/)
  })
})
