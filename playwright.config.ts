import { defineConfig, devices } from '@playwright/test';

const isHeaded = process.argv.includes('--headed');

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : 1,//undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  //reporter: 'html', //Default
  
  //Jenkins to generate JUnit report and HTML report for local execution in Octane
  reporter: process.env.CI
    ? [
        ['list'],
        ['junit', { outputFile: process.env.PLAYWRIGHT_JUNIT_OUTPUT_NAME || 'results/junit.xml' }], // JUnit report for Jenkins with default name results/junit.xml if PLAYWRIGHT_JUNIT_OUTPUT_NAME is not set
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
      ]
    : 'html',

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */

    headless: !isHeaded,

    viewport: isHeaded ? null : { width: 1920, height: 1080 },
    launchOptions: { args: isHeaded ? ['--start-maximized'] : [] },
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [

    /* ------------------------------ API ------------------------------ */

  {
    name: 'API',
    testDir: './tests/API'
  },

  /* ------------------------------ AI ------------------------------ */

  {
    name: 'AI',
    testDir: './tests/AI'
  },  

   /* ------------------------------ WEB ------------------------------ */
       
  {
    name: 'chromium',
    testDir: './tests/WEB',
    use: {
      browserName: 'chromium',
    }
  },

  {
    name: 'firefox',
    testDir: './tests/WEB',
    use: {
      browserName: 'firefox',
    }
  },

  {
    name: 'webkit',
    testDir: './tests/WEB',
    use: {
      browserName: 'webkit',
    }
  }

   

],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
