Feature: Authentication

  Scenario: Register a new account
    Given the user is on the register page
    When the user registers with the following details:
      | Username | Email            | Password      | Password Confirmation |
      | testuser | test@example.com | Password123!* | Password123!*         |
    Then the user should be on the dashboard
    And the user should see "testuser" in the navigation bar

  Scenario: Log out
    Given the following user exists:
      | Username | Email            | Password      | Password Confirmation |
      | testuser | test@example.com | Password123!* | Password123!*         |
    And the user is logged in
    When the user signs out
    Then the user should be on the login page

  Scenario: Log in with valid credentials
    Given the following user exists:
      | Username | Email            | Password      | Password Confirmation |
      | testuser | test@example.com | Password123!* | Password123!*         |
    And the user is on the login page
    When the user logs in with the following credentials:
      | Username | Password      |
      | testuser | Password123!* |
    Then the user should be on the dashboard
    And the user should see "testuser" in the navigation bar

  Scenario: Protected route redirects to login
    When the user navigates to the dashboard
    Then the user should be on the login page
