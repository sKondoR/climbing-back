import { Injectable } from '@nestjs/common';
import { RouteItems } from './routes.interfaces';

// import puppeteer from 'puppeteer-core';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Nightmare = require('nightmare');

// eslint-disable-next-line @typescript-eslint/no-require-imports

// const LOCAL_CHROME_EXECUTABLE =
// 'C:/Users/Sergey_Kondrashin/.cache/puppeteer/chrome/win64-129.0.6668.58/chrome-win64/chrome.exe';
// 'C:/Program Files/Google/Chrome/Application/chrome.exe';

// const BUTTON_SELECTOR = '.load-more';

@Injectable()
export class AppService {
  async getClimberById(id: string): Promise<RouteItems> {
    const nightmare = Nightmare({
      gotoTimeout: 1200000,
      show: true,
      webPreferences: {
        images: false,
      },
      // eslint-disable-next-line prettier/prettier, @typescript-eslint/no-require-imports
      electronPath: require('./node_modules/electron')
    });
    let result = [];
    await nightmare
      .goto(`https://www.allclimb.com/ru/climber/${id}`)
      .evaluate(() => {
        return Array.from(document.querySelectorAll('.news-preview')).map(
          (el) => ({
            isBoulder: el.textContent.includes('Боулдер'),
            grade: el.querySelector('h4').textContent.trim(),
            // '.news-preview-title'
            name: el.querySelector('b').textContent.trim(),
            date: el.querySelector('.news-preview-date').textContent.trim(),
          }),
        );
      })
      .end()
      .then((data) => {
        result = data;
      })
      .catch((error) => {
        console.error('Search failed:', error);
      });

    return result;
    // const options = process.env.AWS_REGION
    //   ? {
    //       ignoreHTTPSErrors: true,
    //       args: chromium.args,
    //       defaultViewport: chromium.defaultViewport,
    //       executablePath: await chromium.executablePath(),
    //       headless: false,
    //     }
    //   : {
    //       args: [
    //         '--no-sandbox',
    //         '--disable-setuid-sandbox',
    //         '--disable-gpu',
    //         '--ignore-certificate-errors',
    //         '--disable-extensions',
    //       ],
    //       executablePath: process.platform.includes('win')
    //         ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    //         : process.platform === 'linux'
    //           ? '/usr/bin/google-chrome'
    //           : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    //     };

    // return [process.env.AWS_REGION, `${process.platform.includes('win')}`];
    // const executablePath = process.env.NODE_ENV.includes('dev')
    //   ? LOCAL_CHROME_EXECUTABLE
    //   : await chromium?.executablePath();
    // const args = process.env.NODE_ENV.includes('dev')
    //   ? [
    //       '--no-sandbox',
    //       '--disable-setuid-sandbox',
    //       '--disable-gpu',
    //       '--ignore-certificate-errors',
    //       '--disable-extensions',
    //     ]
    //   : chromium.args;

    // const browser = await puppeteerCore.launch(options);
    // const page = await browser.newPage();
    // let result = [];
    // let doRequests = true;

    // try {
    //   await page.goto(`https://www.allclimb.com/ru/climber/${id}`);

    // const button = await page.$$(BUTTON_SELECTOR);

    // const getRoutes = async () => {
    //   const data = await page.$$eval('.news-preview', (elements) => {
    //     return elements.map((element) => ({
    //       isBoulder: element.textContent.includes('Боулдер'),
    //       grade: element.querySelector('h4').textContent.trim(),
    //       // '.news-preview-title'
    //       name: element.querySelector('b').textContent.trim(),
    //       date: element
    //         .querySelector('.news-preview-date')
    //         .textContent.trim(),
    //     }));
    //   });
    //   return data;
    // };

    // result = await getRoutes();
    // return result;
    // while (doRequests) {
    //   await button[0].click();
    //   await page.waitForSelector('#wall', { visible: true });
    //   await page.waitForSelector('#wall', { visible: false });
    //   const data = await getRoutes();
    //   doRequests = data.length > result.length;
    //   result = data;
    // }

    // return result;
    // } catch (error) {
    //   console.error('Error while scraping job listings:', error);
    // } finally {
    //   await browser.close();
    // }
  }
}
