import { truncateAll } from './e2e/support/db';

export const config: WebdriverIO.Config = {
  runner: 'local',
  tsConfigPath: './tsconfig.json',

  specs: ['./e2e/features/**/*.feature'],
  exclude: [],

  maxInstances: 10,
  capabilities: [
    {
      browserName: 'chrome',
      'goog:chromeOptions': {
        args: ['--no-sandbox', '--disable-gpu'],
      },
    },
  ],

  logLevel: 'info',
  bail: 0,
  baseUrl: 'http://localhost:3000',
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  framework: 'cucumber',
  reporters: [['allure', { outputDir: 'allure-results' }]],

  cucumberOpts: {
    require: ['./e2e/features/step-definitions/*.ts'],
    backtrace: false,
    requireModule: [],
    dryRun: false,
    failFast: false,
    name: [],
    snippets: true,
    source: true,
    strict: false,
    timeout: 60000,
    ignoreUndefinedDefinitions: false,
  },

  onPrepare: async function () {
    await truncateAll();
  },

  beforeScenario: async function () {
    await truncateAll();
    // reloadSession() is required because deleteCookies() cannot clear HttpOnly
    // JWT cookies set by the backend on a different port, and the React AuthProvider
    // caches auth state in memory — a cookie delete alone leaves stale sessions.
    await browser.reloadSession();
  },

  afterStep: async function (_step, _scenario, result) {
    if (!result.passed) {
      await browser.takeScreenshot();
    }
  },
};
