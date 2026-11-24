import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

for (const colorScheme of ['light', 'dark'] as const) {
  test(`facturas has no serious or critical axe violations (${colorScheme})`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme });
    await page.goto('/login');
    await page.getByLabel('Correo').fill('contador@demo.cl');
    await page.getByLabel('Contraseña').fill('Demo1234!');
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await expect(page).toHaveURL('/');

    await page.goto('/facturas');
    await expect(page.getByRole('heading', { name: 'Facturas', level: 1 })).toBeVisible();

    const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze();
    const graves = violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );

    expect(graves.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });
}
