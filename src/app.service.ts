import { Injectable } from '@nestjs/common';
import edgeChromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';

const LOCAL_CHROME_EXECUTABLE =
  // 'C:/Users/Sergey_Kondrashin/.cache/puppeteer/chrome/win64-129.0.6668.58/chrome-win64/chrome.exe';
  'C:/Program Files/Google/Chrome/Application/chrome.exe';

const BUTTON_SELECTOR = '.load-more';
@Injectable()
export class AppService {
  async getClimberById(id: string): Promise<Array<string>> {
    const executablePath =
      (await edgeChromium?.executablePath) || LOCAL_CHROME_EXECUTABLE;

    const browser = await puppeteer.launch({
      executablePath,
      args: edgeChromium?.args,
      headless: false,
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
