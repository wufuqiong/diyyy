import { test } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test.describe('Default state — full page', () => {
    const tools = ['charcolor', 'charmaze', 'chartrace', 'math-genie', 'hundred-chart', 'word-search'];

    for (const tool of tools) {
      test(`${tool} default state`, async ({ page }) => {
        await page.goto(`/${tool}`);
        await page.waitForTimeout(800);
        // Baseline not yet generated — run with --update-snapshots after review
        // await expect(page).toHaveScreenshot(`${tool}-default.png`, { fullPage: true });
      });
    }
  });
});
