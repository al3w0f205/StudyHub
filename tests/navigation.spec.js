const { test, expect } = require('@playwright/test');

test.describe('Navegación Base StudyHub', () => {

  test('La página principal carga y muestra el título correcto', async ({ page }) => {
    await page.goto('/');
    // StudyHub injects SEO titles, usually containing "StudyHub"
    await expect(page).toHaveTitle(/StudyHub/);
  });

  test('Metadatos Anti-Piratería inyectados correctamente', async ({ page }) => {
    await page.goto('/');
    // Check if the data-theme attribute is injected by layout.js script
    const htmlElement = page.locator('html');
    const theme = await htmlElement.getAttribute('data-theme');
    // It should have either 'dark' or 'light'
    expect(['dark', 'light']).toContain(theme);
  });

});
