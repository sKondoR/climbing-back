import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';

const BUTTON_SELECTOR = '.load-more';

function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class AppService {
  async getClimberById(id: string): Promise<Array<string>> {
    const browser = await puppeteer.launch();
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
        await timeout(1000);
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
