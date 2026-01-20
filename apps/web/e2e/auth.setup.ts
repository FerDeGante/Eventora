import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate as user', async ({ page }) => {
  // Go to login page
  await page.goto('/login');
  
  // Fill in credentials (use test credentials)
  await page.locator('input[type="email"]').fill(process.env.TEST_USER_EMAIL || 'test@bloom.com');
  await page.locator('input[type="password"]').fill(process.env.TEST_USER_PASSWORD || 'testpassword123');
  
  // Click login button
  await page.locator('button[type="submit"]').click();
  
  // Wait for navigation or success indicator
  await page.waitForURL(/dashboard|inicio|home/i, { timeout: 10000 });
  
  // Save authenticated state
  await page.context().storageState({ path: authFile });
});
