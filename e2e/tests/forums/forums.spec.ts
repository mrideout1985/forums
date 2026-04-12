import { expect, test } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { truncateAll } from '../../support/db';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Forums (authenticated)', () => {
  test.beforeEach(async ({ page, request }) => {
    await truncateAll();

    const registerResponse = await request.post(
      'http://localhost:8080/api/auth/register',
      {
        data: {
          username: 'testuser',
          email: 'testuser@example.com',
          password: 'TestPassword1!',
          confirmPassword: 'TestPassword1!',
        },
      },
    );
    expect(registerResponse.ok()).toBe(true);

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login({
      username: 'testuser',
      password: 'TestPassword1!',
    });
    await expect(page).toHaveURL('/');
  });

  test('authenticated user can see the forums list', async ({ page }) => {
    await page.goto('/forums');

    await expect(
      page.getByRole('heading', { level: 1, name: 'Explore Forums' }),
    ).toBeVisible();
  });
});
