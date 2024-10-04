// eslint-disable-next-line @typescript-eslint/no-require-imports
const chromium = require('@sparticuz/chromium');
import puppeteer from 'puppeteer';

import { IClimberParse } from './scraping.interfaces';
import {
  ALLCLIMB_URL,
  LOCAL_CHROME_EXECUTABLE,
  BUTTON_MORE_SELECTOR,
} from './scraping.constants';
import { filterRoutes, parseClimberName } from './scraping.utils';

chromium.setHeadlessMode = false;

const delay = (time) => {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
};

const LOAD_DELAY = 2000;
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
      const climberName = await page.$$eval(
        '.climber-info-block > p',
        (elements) => {
          return elements[0].textContent.trim();
        },
      );

      const getRoutes = async () => {
        const data = await page.$$eval('.news-preview', (elements) => {
          return elements.map((el) => {
            const allText = el
              .querySelector('.news-preview-title')
              .textContent.trim();
            return {
              isBoulder: allText.includes('Боулдер'),
              isTopRope: allText.includes('Верхняя страховка.'),
              grade: el.querySelector('h4').textContent.trim(),
              name: el.querySelector('b').textContent.trim(),
              date: el.querySelector('.news-preview-date').textContent.trim(),
              text: allText,
            };
          });
        });
        return data;
      };

      result = await getRoutes();
      while (doRequests) {
        await button[0].click();
        await page.waitForSelector('#wall', { visible: true });
        await page.waitForSelector('#wall', { visible: false });
        await delay(LOAD_DELAY);
        const data = await getRoutes();
        doRequests = data.length > result.length;
        result = data;
      }

      await browser.close();
      return {
        name: parseClimberName(climberName),
        ...filterRoutes(result),
      };
    } catch (error) {
      console.error('Error while scraping job listings:', error);
    } finally {
      await browser.close();
    }
  }
}
