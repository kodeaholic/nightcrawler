/* eslint-disable no-console */
const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { path } = require('chromedriver');

const main = async () => {
  const { By, until, Key } = webdriver;
  const options = new chrome.Options();
  options.addArguments('headless');
  options.addArguments('disable-gpu');

  const service = new chrome.ServiceBuilder(path).build();
  chrome.setDefaultService(service);
  const driver = new webdriver.Builder()
    .forBrowser('chrome')
    .withCapabilities(webdriver.Capabilities.chrome())
    .setChromeOptions(options) // note this
    .build();

  try {
    await driver.get('http://cophim.com/danh-sach/phim-le/');
    const list = await driver.findElements(By.css('a[class*="film-small"]'));
    // await driver.wait(until.titleIs('webdriver - Google Search'), 1000);
    console.log(list.length);
    console.log(await list[0].getAttribute('href'));
  } finally {
    await driver.quit();
  }
};

main();
