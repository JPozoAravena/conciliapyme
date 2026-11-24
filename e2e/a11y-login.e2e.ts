import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

for (const colorScheme of ['light', 'dark'] as const) {
  test(`login has no serious or critical axe violations (${colorScheme})`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme });
    await page.goto('/login');
    await expect(page.getByLabel('Correo')).toBeVisible();
    // Contrast is only meaningful once the entrance fade-in has finished.
    await page.waitForFunction(() =>
      [...document.querySelectorAll<HTMLElement>('[style*="opacity"]')].every(
        (el) => getComputedStyle(el).opacity === '1',
      ),
    );

    const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze();
    const graves = violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );

    expect(graves.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });
}
