const { chromium } = require('../../node_modules/playwright');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of [390, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: 'block' });
      let signedIn = false;
      await context.route('**/api/auth/session', r => r.fulfill({ json: signedIn ? { user: { id: '00000000-0000-4000-8000-000000000001' }, access_token: 'ui-test-only' } : {} }));
      await context.route('**/rest/v1/**', r => r.fulfill({ json: [] }));
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
      assert.equal(await page.locator('#cold-storage').count(), 0);
      signedIn = true;
      await page.reload({ waitUntil: 'networkidle' });
      await page.getByRole('button', { name: 'Change language' }).click();
      const section = page.locator('#cold-storage');
      await section.getByLabel('District or upazila to search').fill('Bogura & Rangpur');
      const link = new URL(await section.getByRole('link').getAttribute('href'));
      assert.equal(link.hostname, 'www.google.com');
      assert.equal(link.searchParams.get('query'), 'potato cold storage Bogura & Rangpur Bangladesh');
      await section.locator('summary').first().click();
      await section.getByLabel('Total potatoes (kg)').fill('1000');
      const first = section.locator('fieldset').first();
      await first.getByLabel('Rate per kg (BDT)').fill('5');
      await first.getByLabel('Total outward + return transport (BDT)').fill('2000');
      await first.getByLabel('Total handling + bags (BDT)').fill('500');
      assert.equal(await first.locator('output').count(), 0);
      await first.getByLabel('Other charges including taxes (BDT)').fill('0');
      assert.match(await first.locator('output').innerText(), /Total cost: ৳7,500/);
      await first.getByLabel('Rate covers').selectOption('month');
      await first.getByLabel('Number of billed months').fill('2');
      assert.match(await first.locator('output').innerText(), /Total cost: ৳12,500/);
      await first.getByLabel('Rate per kg (BDT)').fill('-1');
      assert.equal(await first.locator('output').count(), 0);
      await first.getByLabel('Rate per kg (BDT)').fill('5');
      await section.getByRole('button', { name: 'Compare a second storage quote' }).click();
      const second = section.locator('fieldset').nth(1);
      for (const [label, value] of [['Rate per kg (BDT)', '6'], ['Total outward + return transport (BDT)', '0'], ['Total handling + bags (BDT)', '0'], ['Other charges including taxes (BDT)', '0']]) await second.getByLabel(label).fill(value);
      assert.match(await section.innerText(), /Cost difference: ৳6,500/);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await section.screenshot({ path: `test-results/cold-storage-${width}.png` });
      await page.getByRole('button', { name: 'Change language' }).click();
      assert.match(await section.innerText(), /হিমাগার খুঁজুন/);
      assert.deepEqual(errors, []);
      console.log(`Cold storage ${width}px: passed`);
      await context.close();
    }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
