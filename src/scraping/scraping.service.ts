import { Injectable } from '@nestjs/common';
import { IClimberParse } from './scraping.interfaces';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const chromium = require('@sparticuz/chromium');
import puppeteer from 'puppeteer';
import {
  ALLCLIMB_URL,
  LOCAL_CHROME_EXECUTABLE,
  BUTTON_MORE_SELECTOR,
  NAME_BOX_SELECTOR,
  ROUTES_SELECTOR,
} from './scraping.constants';
import { parseRoute } from './scraping.utils';

chromium.setHeadlessMode = false;

const delay = (time) => {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
};

@Injectable()
export class ScrapingService {
  async getClimberById(id: string): Promise<IClimberParse> {
    const executablePath =
      (await chromium?.executablePath) || LOCAL_CHROME_EXECUTABLE;

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    let result = [];
    let doRequests = true;

    try {
      await page.goto(`${ALLCLIMB_URL}/${id}`);

      const button = await page.$$(BUTTON_MORE_SELECTOR);
      const name = await page.$eval(NAME_BOX_SELECTOR, (element) => {
        return element.textContent.trim();
      });
      console.log('button: ', button.length);
      const getRoutes = async () => {
        const data = await page.$$eval(ROUTES_SELECTOR, (elements) =>
          elements.map(parseRoute),
        );
        return data;
      };

      result = await getRoutes();
      while (doRequests) {
        await button[0].click();
        await page.waitForSelector('#wall', { visible: true });
        await page.waitForSelector('#wall', { visible: false });
        await delay(2000);
        const data = await getRoutes();
        doRequests = data.length > result.length;
        result = data;
      }

      await browser.close();
      return {
        name,
        routes: result,
      };
    } catch (error) {
      console.error('Error while scraping job listings:', error);
    } finally {
      await browser.close();
    }
  }
}
