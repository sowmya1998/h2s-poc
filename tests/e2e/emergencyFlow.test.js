import { test, expect } from '@playwright/test'

test.describe('UIT Emergency Flow', () => {
  test('should show emergency mode for critical input', async ({ page }) => {
    await page.goto('/')

    // Fill the input with an emergency scenario
    await page.fill('textarea', 'My father is 55, chest pain, sweating heavily, dizzy.')
    
    // Click submit
    await page.click('button:has-text("PROCESS INTENT")')

    // Wait for the result to appear
    await expect(page.locator('text=Translation Results')).toBeVisible({ timeout: 15000 })

    // Check for emergency indicators (Red background or specific text)
    // Note: In E2E tests we check for user-facing elements
    const emergencyMode = page.locator('text=EMERGENCY MODE ACTIVE')
    await expect(emergencyMode).toBeVisible()
    
    // Ensure the Dial Emergency button is present
    await expect(page.locator('text=DIAL EMERGENCY (108)')).toBeVisible()
  })

  test('should respect Safe Mode setting', async ({ page }) => {
    await page.goto('/')
    
    // Toggle Safe Mode (we'll implement the toggle in the next step)
    await page.click('button[aria-label="Toggle Safe Mode"]')
    
    // Fill emergency input
    await page.fill('textarea', 'Heart Attack emergency!')
    await page.click('button:has-text("PROCESS INTENT")')
    
    // In E2E, we can't easily "hear" the sound, but we can verify the state
    // For now, we verify the UI still shows the alert visuals
    await expect(page.locator('text=EMERGENCY MODE ACTIVE')).toBeVisible()
  })
})
