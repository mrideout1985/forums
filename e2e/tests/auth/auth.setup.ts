import { expect, test as setup } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LoginPage } from '../../pages/login.page';
import { truncateAll } from '../../support/db';

// This file runs once as a "setup" project before the main test suite.
// It registers a user, logs in, and saves the authenticated browser state
// so all other tests can start already logged in.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const authFile = path.join(__dirname, '../../playwright/.auth/user.json');

setup('authenticate as test user', async ({ page, request }) => {
  // 1. Clean slate — truncate so we can create our known test user
  await truncateAll();

  // 2. Register the test user via the API (faster than going through the UI)
  // Use the full backend URL — the request fixture inherits baseURL (frontend),
  // but the API runs on a separate Spring Boot server at port 8080.
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

  // 3. Log in through the UI so the browser gets the auth cookie
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login({
    username: 'testuser',
    password: 'TestPassword1!',
  });

  // 4. Verify login succeeded — we should land on the home page
  await expect(page).toHaveURL('/');

  // 5. Save the authenticated state (cookies + localStorage) for other tests
  await page.context().storageState({ path: authFile });
});
