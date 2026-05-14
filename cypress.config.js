const { defineConfig } = require('cypress');

/** E2E against React TodoMVC demo — mirrors `test plan.md` (TC-001–TC-017). */
module.exports = defineConfig({
  allowCypressEnv: false,
  e2e: {
    baseUrl: 'https://demo.playwright.dev',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    video: false,
    screenshotOnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 720,
  },
});
