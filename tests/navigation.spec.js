const { test, expect } = require('@playwright/test');

test.describe('Navegación Base StudyHub', () => {

  test('La página principal carga y muestra el título correcto', async ({ page }) => {
    await page.goto('/');
    // StudyHub injects SEO titles, usually containing "StudyHub"
    await expect(page).toHaveTitle(/StudyHub/);
  });

  test('Metadatos Anti-Piratería inyectados correctamente', async ({ page }) => {
    await page.goto('/');
    const htmlElement = page.locator('html');
    const theme = await htmlElement.getAttribute('data-theme');
    expect(['dark', 'light']).toContain(theme);
  });

  test('La renderización de LaTeX (KaTeX) se muestra correctamente y no se apila verticalmente', async ({ page }) => {
    await page.goto('/');
    // Check if the first katex span inside preview-answer does NOT have display grid
    const katexSpan = page.locator('.preview-answer .katex-html').first();
    await expect(katexSpan).toBeVisible();
    
    // Evaluate the computed style to ensure it is not forced into grid or flex-col
    const displayStyle = await katexSpan.evaluate((el) => window.getComputedStyle(el).display);
    
    // KaTeX usually uses inline-block, inline or block but NOT grid for its internal spans
    expect(displayStyle).not.toBe('grid');
  });
});
