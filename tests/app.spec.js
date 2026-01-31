const { test, expect } = require('@playwright/test');
const testData = require('../data/testData.json'); // Import your data

test.describe('Singlish to Sinhala Transliteration Tests', () => {

    // Runs before every single test case
    test.beforeEach(async ({ page }) => {
        await page.goto('https://www.swifttranslator.com/');
    });

    // Loop through each test case in the JSON file
    for (const data of testData) {
        test(`${data.id}: ${data.name}`, async ({ page }) => {
            // 1. Identify input and output fields using locators
            const inputField = page.getByPlaceholder('Input Your Singlish Text Here.');
            // Output is a DIV, not a textarea, so we target the div following the 'Sinhala' title
            const outputField = page.locator('.panel-title', { hasText: 'Sinhala' }).locator('xpath=following-sibling::div[1]');

            // 2. Simulate real user typing
            await inputField.fill(data.input);

            // 3. Verify real-time output matches expectation
            // Use toHaveText for non-input elements
            await expect(outputField).toHaveText(data.expected);

            // Capture actual output for reporting
            const actualOutput = await outputField.textContent();
            test.info().annotations.push({ type: 'actualOutput', description: actualOutput });
        });
    }

    // Mandatory UI Test Case
    test('Pos_UI_0001: Output updates in real-time', async ({ page }) => {
        const inputField = page.getByPlaceholder('Input Your Singlish Text Here.');
        const outputField = page.locator('.panel-title', { hasText: 'Sinhala' }).locator('xpath=following-sibling::div[1]');

        await inputField.pressSequentially('m'); // Simulates individual key presses
        await expect(outputField).not.toBeEmpty();
    });
});
