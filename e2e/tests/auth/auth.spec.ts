import { expect, test } from '@playwright/test';
import { RegisterPage } from '../../pages/register.page';
import { truncateAll } from '../../support/db';

test.describe('User registration', () => {
  test.beforeEach(async () => {
    await truncateAll();
  });

  test('new user can sign up and lands authenticated on the home page', async ({
    page,
  }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();

    const username = `alice_${Date.now()}`;
    await registerPage.register({
      username,
      email: `${username}@example.com`,
      password: 'Sup3rSecret!',
    });

    await expect(page).toHaveURL('/');

  });

  test('existing user can log in', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();

    const username = `bob_${Date.now()}`;
    await registerPage.register({
      username,
      email: `${
        username
      }@example.com`,
      password: 'An0therS3cret!',
    });

    await registerPage.signInLink.click();
    await registerPage.logoutButton.click();

    await expect(page).toHaveURL('/login');

    await page.getByLabel('Username *').fill(username);
    await page.getByLabel('Password *').fill('An0therS3cret!');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page).toHaveURL('/');
  });
});
