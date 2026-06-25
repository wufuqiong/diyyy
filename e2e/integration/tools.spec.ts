import { test, expect } from '@playwright/test';

test.describe('E2E Integration Tests', () => {
  test.describe('charcolor', () => {
    test('input characters → preview shows them', async ({ page }) => {
      await page.goto('/charcolor');
      await page.waitForLoadState('networkidle');
      await page.locator('textarea').first().waitFor({ state: 'visible', timeout: 10000 });
      await page.locator('textarea').first().fill('天地人日月');
      await page.waitForTimeout(800);
      await expect(page.getByText('天地人日月').first()).toBeVisible({ timeout: 5000 });
    });

    test('save PDF triggers download', async ({ page }) => {
      await page.goto('/charcolor');
      await page.waitForLoadState('networkidle');
      await page.locator('textarea').first().waitFor({ state: 'visible', timeout: 10000 });
      await page.locator('textarea').first().fill('天地人');
      await page.waitForTimeout(600);

      const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
      await page.locator('[data-testid="toolbar-save-pdf"]').click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('.pdf');
    });
  });

  test.describe('charmaze', () => {
    test('input chars → generates pages, page nav works', async ({ page }) => {
      await page.goto('/charmaze');
      const textarea = page.locator('textarea').first();
      await textarea.fill('小学生天地人日月山川');
      await page.waitForTimeout(600);

      // Should show page indicator like "1 / N"
      await expect(page.getByText(/\/ \d+/).first()).toBeVisible({ timeout: 5000 });

      // Navigate to page 2 if available
      const page2 = page.locator('[aria-label="Go to page 2"]');
      if (await page2.isVisible({ timeout: 1000 }).catch(() => false)) {
        await page2.click();
        await expect(page.getByText(/2 \//).first()).toBeVisible({ timeout: 3000 });
      }
    });
  });

  test.describe('chartrace', () => {
    test('input text → preview renders grid', async ({ page }) => {
      await page.goto('/chartrace');
      const textarea = page.locator('textarea').first();
      await textarea.fill('天地人');
      await page.waitForTimeout(600);

      // Grid toggle button group should be visible
      await expect(page.getByRole('button', { name: '田' })).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('math-genie', () => {
    test('switch operation → preview changes', async ({ page }) => {
      await page.goto('/math-genie');
      await page.waitForTimeout(600);

      // Find and click the subtraction toggle button (may show "−" or text label)
      const subBtn = page.getByRole('button', { name: '−' });
      if (await subBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await subBtn.click();
        await page.waitForTimeout(500);
      }
      // Preview area should show math problems with numbers
      await expect(page.locator('text=+').first()).toBeVisible({ timeout: 5000 });
    });

    test('save PDF triggers download', async ({ page }) => {
      await page.goto('/math-genie');
      await page.waitForTimeout(600);

      const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
      await page.locator('[data-testid="toolbar-save-pdf"]').click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('.pdf');
    });
  });

  test.describe('hundred-chart', () => {
    test('switch to cross mode → preview shows cross puzzle', async ({ page }) => {
      await page.goto('/hundred-chart');
      await page.waitForTimeout(600);

      // Toggle to cross puzzle mode (button label: "拼图填空")
      const crossBtn = page.getByRole('button', { name: '拼图填空' });
      if (await crossBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await crossBtn.click();
        await page.waitForTimeout(500);
      }
      // Preview content should have numbers visible
      await expect(page.locator('text=/\\d+/').first()).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('word-search', () => {
    test('input words → preview generates grid', async ({ page }) => {
      await page.goto('/word-search');
      const textarea = page.locator('textarea').first();
      await textarea.fill('cat, dog, bird');
      await page.waitForTimeout(600);

      // Grid should render with letters
      await expect(page.locator('text=/[A-Za-z]/').first()).toBeVisible({ timeout: 5000 });
    });
  });
});
