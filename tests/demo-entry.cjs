const { chromium } = require('../../node_modules/playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch();
  try {
    for (const width of [390, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: 'block' });
      const cloud = [];
      await context.route('**/api/auth/**', r => { cloud.push(r.request().url()); return r.fulfill({ json: {} }); });
      await context.route('**/rest/v1/**', r => { cloud.push(r.request().url()); return r.fulfill({ json: [] }); });
      const page = await context.newPage();
      await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
      await page.getByRole('button', { name: 'Change language' }).click();
      cloud.length = 0;
      await page.getByRole('link', { name: 'Log in', exact: true }).click();
      await page.waitForURL('http://127.0.0.1:4173/');
      await page.locator('#cold-storage').waitFor();
      assert.equal(await page.locator('input[type=password]').count(), 0);
      assert.match(await page.locator('#diary').innerText(), /Demo: this device only/);
      assert.deepEqual(cloud, []);
      await page.reload({ waitUntil: 'networkidle' });
      await page.locator('#cold-storage').waitFor();
      await page.getByRole('button', { name: 'Sign out', exact: true }).click();
      assert.equal(await page.locator('#cold-storage').count(), 0);
      assert.equal(await page.locator('#diary').count(), 0);
      assert.equal(cloud.some(url => url.includes('signout') || url.includes('/rest/v1/')), false);
      console.log(`Demo entry ${width}px: passed`);
      await context.close();
    }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
