import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Correo').fill('contador@demo.cl');
  await page.getByLabel('Contraseña').fill('Demo1234!');
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page).toHaveURL('/');
});

for (const [ruta, titulo] of [
  ['/importar', 'Importar cartola'],
  ['/conciliacion', 'Conciliación'],
] as const) {
  test(`${ruta} has no serious or critical axe violations`, async ({ page }) => {
    await page.goto(ruta);
    await expect(
      page.getByRole('heading', { level: 1, name: titulo }),
    ).toBeVisible();

    const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze();
    const graves = violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );

    expect(graves.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });
}
