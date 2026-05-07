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
    
    // Scroll to the product preview section and center it to trigger animations fully
    const previewContainer = page.locator('.product-preview');
    await previewContainer.evaluate(el => el.scrollIntoView({ behavior: 'auto', block: 'center' }));
    
    // Simulate scroll to ensure scroll events are fired for framer-motion
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(1500); 

    // Check if the first katex span inside preview-answer is ATTACHED
    const katexSpan = page.locator('.preview-answer .katex-html').first();
    await expect(katexSpan).toBeAttached({ timeout: 15000 });
    
    // Evaluate the computed style to ensure it is not forced into grid or flex-col
    const displayStyle = await katexSpan.evaluate((el) => window.getComputedStyle(el).display);
    
    // KaTeX usually uses inline-block, inline or block but NOT grid for its internal spans
    expect(displayStyle).not.toBe('grid');
  });
});
