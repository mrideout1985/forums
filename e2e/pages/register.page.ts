import type { Locator, Page } from '@playwright/test';

export class RegisterPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly usernameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;
  readonly errorAlert: Locator;
  readonly signInLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Rideout Forums' });
    this.usernameInput = page.getByRole('textbox', { name: 'Username' });
    this.emailInput = page.getByRole('textbox', { name: 'Email' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password', exact: true });
    this.confirmPasswordInput = page.getByRole('textbox', { name: 'Confirm password', exact: true });   
    this.submitButton = page.getByRole('button', { name: 'Create account' });
    this.errorAlert = page.getByRole('alert');
    this.signInLink = page.getByRole('link', { name: 'Sign in' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/register');
  }

  async register(input: {
    username: string;
    email: string;
    password: string;
    confirmPassword?: string;
  }): Promise<void> {
    await this.usernameInput.fill(input.username);
    await this.emailInput.fill(input.email);
    await this.passwordInput.fill(input.password);
    await this.confirmPasswordInput.fill(
      input.confirmPassword ?? input.password
    );
    await this.submitButton.click();
  }
}
