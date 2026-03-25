import BasePage from './base.page.js';

class LoginPage extends BasePage {
  get usernameInput() {
    return $('[name="username"]');
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

  async login(username: string, password: string) {
    await this.usernameInput.waitForDisplayed();
    await this.usernameInput.click();
    await browser.keys(username);
    await this.passwordInput.click();
    await browser.keys(password);
    await this.submitButton.click();
  }

  async open() {
    await super.open('/login');
  }
}

export default new LoginPage();
