const { test } = require('@playwright/test');
const fs = require('fs');

test('Debug Selectors', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto('https://www.swifttranslator.com/', { timeout: 60000, waitUntil: 'domcontentloaded' });

    // Find Sinhala Panel Title
    const sinhalaHeader = page.locator('.panel-title', { hasText: 'Sinhala' });
    if (await sinhalaHeader.count() > 0) {
        const header = sinhalaHeader.first();
        const headerRow = header.locator('xpath=..');
        const column = headerRow.locator('xpath=..');

        const html = await column.innerHTML();
        console.log('DEBUG: Writing HTML to debug_output.txt');
        fs.writeFileSync('debug_output.txt', html);
    } else {
        console.log('DEBUG: Sinhala header not found.');
    }
});
