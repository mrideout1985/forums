---
paths:
  - "e2e/**/*"
---

# E2E Testing Standards (Playwright)

## Test Design
- Each test is atomic — creates its own data, runs independently, leaves no residue
- Never rely on execution order or shared state between tests
- Use `test.describe` to group related tests; `test.beforeEach` for per-test setup
- One behavior per test; assertions should describe user-visible outcomes
- Prefer `test.step()` to document multi-step user journeys

## Locator Priority (use Playwright's built-in locators)
1. `page.getByRole('button', { name: 'Sign in' })` — role + accessible name
2. `page.getByLabel('Username')` — for form fields
3. `page.getByPlaceholder(...)`, `page.getByText(...)` when role is unavailable
4. `page.getByTestId('...')` — last resort, requires `data-testid`
5. CSS only as a final fallback

**Never use**: generated class names (`.MuiButton-root`), deep CSS nesting, XPath.

## Auto-waiting
- Playwright auto-waits on actions and `expect()` assertions — never `page.waitForTimeout()`
- Use web-first assertions: `await expect(locator).toBeVisible()`, `.toHaveText()`, `.toHaveURL()`
- For non-UI conditions use `expect.poll()` or `page.waitForResponse()`

## Page Objects
- One page object per logical page/view under `e2e/pages/`
- Locators as `readonly` properties initialized in the constructor from the `Page`
- Page methods encapsulate multi-step actions (fill + submit)
- Tests call page methods, never raw locators

## Test Isolation
- Truncate the DB before each test via a helper that talks directly to Postgres
- Each test gets a fresh `page` (Playwright provides this by default per test)
- Set up test data via direct API calls (`request` fixture) in setup, never through the UI

## Project Structure
```
e2e/
  playwright.config.ts
  tests/         # *.spec.ts files
  pages/         # page objects
  support/       # db helpers, api helpers, fixtures
```

## Fixtures
- Extend `test` with custom fixtures for authenticated users, seeded data, API clients
- Prefer fixtures over `beforeEach` when setup is reusable across files
