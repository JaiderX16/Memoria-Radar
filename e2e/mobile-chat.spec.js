import { test, expect } from '@playwright/test';

test.use({
  viewport: { width: 375, height: 667 }, // iPhone SE view
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
  hasTouch: true,
  isMobile: true
});

test('Mobile chat opens and input is visible', async ({ page }) => {
  console.log('Navigating to app...');
  await page.goto('http://localhost:5173');

  // Wait for initial load
  await page.waitForTimeout(3000);

  // Locate the chat toggle button.
  // Trying finding by aria-label "Abrir Chat"
  const chatButton = page.locator('button[aria-label="Abrir Chat"]').or(page.locator('button[title="Abrir Chat"]'));

  if (await chatButton.count() > 0) {
      console.log('Found chat button by label');
      await chatButton.click();
  } else {
      console.log('Could not find by label, trying generic button selector in controls');
      // Fallback: look for button with MessageSquare icon.
      // Assuming it's the last button in the controls group or just trying a locator for the generic button style
      const buttons = page.locator('button');
      // Just click the last one which is likely the chat toggle in the control group
      await buttons.last().click();
  }

  // Wait for chat to open
  await page.waitForTimeout(1000);

  // Check for the input field
  const input = page.getByPlaceholder('Escribe un mensaje...');
  await expect(input).toBeVisible();

  console.log('Chat input is visible!');

  // Type something
  await input.fill('Hola testing');
  await expect(input).toHaveValue('Hola testing');
  console.log('Typing works!');

  await page.screenshot({ path: 'verification.png' });
});
