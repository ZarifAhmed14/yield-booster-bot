const { chromium } = require("../../node_modules/playwright");
const path = require("node:path");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const errors = [];

  for (const viewport of [
    { name: "desktop", width: 1440, height: 1000 },
    { name: "mobile", width: 390, height: 844 },
  ]) {
    const page = await browser.newPage({ viewport });
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(`${viewport.name}: ${message.text()}`);
    });
    page.on("pageerror", (error) => errors.push(`${viewport.name}: ${error.message}`));

    const response = await page.goto("http://127.0.0.1:8080/", { waitUntil: "networkidle" });
    if (!response || response.status() !== 200) throw new Error(`${viewport.name}: page did not return 200`);
    await page.getByRole("heading", { level: 1 }).waitFor();
    await page.getByRole("button", { name: /পুরো জমি দেখুন|Check whole field/ }).first().click();
    await page.locator("#scan").waitFor();
    const progress = await page.locator(".field-path span").count();
    if (progress !== 5) throw new Error(`${viewport.name}: expected five field points, found ${progress}`);
    await page.screenshot({ path: `test-results/fieldwatch-${viewport.name}.png`, fullPage: true });
    await page.close();
  }

  const inferencePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await inferencePage.goto("http://127.0.0.1:8080/", { waitUntil: "networkidle" });
  await inferencePage.locator('input[type="file"]').setInputFiles(path.resolve(
    ".ml-data/plantvillage/raw/color/Potato___Early_blight/001187a0-57ab-4329-baff-e7246a9edeb0___RS_Early.B 8178.JPG",
  ));
  await inferencePage.getByRole("button", { name: /ছবি পরীক্ষা করুন|Check this photo/ }).click();
  await inferencePage.locator(".result-content").waitFor({ timeout: 30_000 });
  await inferencePage.locator(".result-content h3").getByText(/ফল পরিষ্কার নয়|result is unclear/i).waitFor();
  await inferencePage.locator(".why-card summary").click();
  await inferencePage.getByText(/মাঠের পরীক্ষায় AI এখনো যথেষ্ট নির্ভরযোগ্য নয়|not reliable enough yet/i).waitFor();
  await inferencePage.screenshot({ path: "test-results/fieldwatch-result-mobile.png", fullPage: true });
  const savedEntries = await inferencePage.evaluate(() => JSON.parse(localStorage.getItem("alusathi-field-diary-v1") || "[]").length);
  if (savedEntries < 1) throw new Error("Completed inference was not saved to the field diary");
  await inferencePage.close();

  const offlineContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const offlinePage = await offlineContext.newPage();
  await offlinePage.goto("http://127.0.0.1:8080/", { waitUntil: "networkidle" });
  await offlineContext.setOffline(true);
  await offlinePage.locator('input[type="file"]').setInputFiles(path.resolve(
    ".ml-data/plantvillage/raw/color/Potato___Early_blight/001187a0-57ab-4329-baff-e7246a9edeb0___RS_Early.B 8178.JPG",
  ));
  await offlinePage.getByRole("button", { name: /ছবি পরীক্ষা করুন|Check this photo/ }).click();
  await offlinePage.getByRole("alert").waitFor();
  await offlineContext.setOffline(false);
  await offlinePage.waitForFunction(() => JSON.parse(localStorage.getItem("alusathi-field-diary-v1") || "[]").length > 0, null, { timeout: 30_000 });
  await offlineContext.close();

  await browser.close();
  if (errors.length) throw new Error(`Browser errors:\n${errors.join("\n")}`);
  console.log("FieldWatch desktop and mobile smoke tests passed with no console errors.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
