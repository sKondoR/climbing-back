import { Injectable } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const chromium = require('@sparticuz/chromium');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const puppeteer = require('puppeteer');

chromium.setHeadlessMode = true;
chromium.setGraphicsMode = false;

const BUTTON_SELECTOR = '.load-more';
@Injectable()
export class AppService {
  async getClimberById(id: string): Promise<Array<string>> {
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath:
        process.env.NODE_ENV === 'dev'
          ? await chromium.executablePath()
          : undefined,
      headless: chromium.headless,
    });
    const page = await browser.newPage();
    let result = [];
    let doRequests = true;
    let count = 0;

    try {
      await page.goto(`https://www.allclimb.com/ru/climber/${id}`);

      const button = await page.$$(BUTTON_SELECTOR);

      const getRoutes = async () => {
        const data = await page.$$eval('.news-preview', (elements) => {
          return elements.map((element) => ({
            isBoulder: element.textContent.includes('Боулдер'),
            grade: element.querySelector('h4').textContent.trim(),
            // '.news-preview-title'
            name: element.querySelector('b').textContent.trim(),
            date: element
              .querySelector('.news-preview-date')
              .textContent.trim(),
          }));
        });
        return data;
      };

      result = await getRoutes();
      while (doRequests) {
        await button[0].click();
        await page.waitForSelector('#wall', { visible: true });
        await page.waitForSelector('#wall', { visible: false });
        const data = await getRoutes();
        doRequests = data.length > result.length;
        result = data;
        count = count + 1;
      }

      return [...result, count];
    } catch (error) {
      console.error('Error while scraping job listings:', error);
    } finally {
      await browser.close();
    }
  }
}
