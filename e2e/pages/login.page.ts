import type { Locator, Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // Using role-based locators — Playwright best practice
    this.usernameInput = page.getByLabel('Username');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: 'Sign in' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  async login(input: { username: string; password: string }): Promise<void> {
    await this.usernameInput.fill(input.username);
    await this.passwordInput.fill(input.password);
    await this.submitButton.click();
  }
}
