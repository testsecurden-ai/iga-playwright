const { chromium } = require('playwright');

(async () => {
  // Launch the browser with the custom arguments for 65% zoom
  const browser = await chromium.launch({
    headless: false,
    args: ['--force-device-scale-factor=0.65']
  });
  
  // Create a context that ignores HTTPS errors
  const context = await browser.newContext({
    ignoreHTTPSErrors: true
  });
  
  // Create a new page and navigate to your URL
  const page = await context.newPage();
  await page.goto('https://localhost:5959');
  
  // This opens the Playwright Inspector. 
  // From the Inspector window, you can click "Record" to generate code.
  await page.pause();
})();
