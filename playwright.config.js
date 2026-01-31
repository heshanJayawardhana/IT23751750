const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './tests',
    reporter: [['json', { outputFile: 'test-results/results.json' }]],
    retries: 2, // Retry failed tests twice
    use: {
        headless: true,
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true,
        actionTimeout: 30000,
        navigationTimeout: 60000,
    },
    timeout: 60000, // Global timeout per test
});
