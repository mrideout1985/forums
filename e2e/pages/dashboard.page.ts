import BasePage from './base.page.js';

class DashboardPage extends BasePage {
  get heading() {
    return $('h1');
  }

  get signOutButton() {
    return $('aria/Sign out');
  }

  get navbar() {
    return $('header');
  }

  async open() {
    await super.open('/');
  }
}

export default new DashboardPage();
