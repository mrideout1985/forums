import { Given, When, Then, type DataTable } from '@wdio/cucumber-framework';
import { expect } from '@wdio/globals';
import LoginPage from '../../pages/login.page.js';
import RegisterPage from '../../pages/register.page.js';
import DashboardPage from '../../pages/dashboard.page.js';
import { registerUser } from '../../support/api.js';

Given('the following user exists:', async (table: DataTable) => {
  const [row] = table.hashes();
  await registerUser(row.Username, row.Email, row.Password);
});

Given('the user is on the login page', async () => {
  await LoginPage.open();
});

Given('the user is on the register page', async () => {
  await RegisterPage.open();
});

Given('the user is logged in', async () => {
  await LoginPage.open();
  await DashboardPage.heading.waitForDisplayed();
  await expect(DashboardPage.heading).toHaveText('Dashboard');
});

When(
  'the user registers with the following details:',
  async (table: DataTable) => {
    const [row] = table.hashes();
    await RegisterPage.register(row.Username, row.Email, row.Password);
  }
);

When(
  'the user logs in with the following credentials:',
  async (table: DataTable) => {
    const [row] = table.hashes();
    await LoginPage.login(row.Username, row.Password);
  }
);

When('the user clicks the {string} button', async (name: string) => {
  const button = $(`aria/${name}`);
  await button.waitForClickable();
  await button.click();
});

When('the user signs out', async () => {
  await DashboardPage.signOutButton.waitForClickable();
  await DashboardPage.signOutButton.click();
});

When('the user navigates to the dashboard', async () => {
  await browser.url('/');
});

Then('the user should be on the dashboard', async () => {
  await DashboardPage.heading.waitForDisplayed();
  await expect(DashboardPage.heading).toHaveText('Dashboard');
});

Then('the user should be on the login page', async () => {
  await LoginPage.submitButton.waitForDisplayed();
  await expect(browser).toHaveUrl(expect.stringContaining('/login'));
});

Then(
  'the user should see {string} in the navigation bar',
  async (text: string) => {
    const navbar = DashboardPage.navbar;
    await navbar.waitForDisplayed();
    await expect(navbar).toHaveText(expect.stringContaining(text));
  }
);

Then(
  'the user should see an error message {string}',
  async (message: string) => {
    await LoginPage.errorAlert.waitForDisplayed();
    await expect(LoginPage.errorAlert).toHaveText(
      expect.stringContaining(message)
    );
  }
);
