const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://doodstream.com/', {
    waitUntil: 'networkidle2',
  });
  await page.screenshot({ path: 'doodstream.png' });

//   await browser.close();
})();
