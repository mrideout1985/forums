import BasePage from './base.page.js';

class RegisterPage extends BasePage {
  get usernameInput() {
    return $('[name="username"]');
  }

  get emailInput() {
    return $('[name="email"]');
  }

  get passwordInput() {
    return $('[name="password"]');
  }

  get submitButton() {
    return $('button[type="submit"]');
  }

  get errorAlert() {
    return $('[role="alert"]');
  }

  async register(username: string, email: string, password: string) {
    await this.usernameInput.waitForDisplayed();
    await this.usernameInput.click();
    await browser.keys(username);
    await this.emailInput.click();
    await browser.keys(email);
    await this.passwordInput.click();
    await browser.keys(password);
    await this.submitButton.click();
  }

  async open() {
    await super.open('/register');
  }
}

export default new RegisterPage();
