import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  // Listen to console logs
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
  
  console.log('Navigating...');
  await page.goto('http://localhost:5173/pass/KQE-274226', { waitUntil: 'networkidle0' });
  
  console.log('Clicking Download PDF...');
  
  // Find the button with text "Download PDF"
  const [downloadBtn] = await page.$x("//button[contains(., 'Download PDF')]");
  if (downloadBtn) {
    await downloadBtn.click();
    console.log('Clicked. Waiting 3 seconds...');
    await new Promise(r => setTimeout(r, 3000));
  } else {
    console.log('Could not find Download PDF button');
  }
  
  await browser.close();
  console.log('Done.');
})();
