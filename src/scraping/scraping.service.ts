import { Injectable } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const chromium = require('puppeteer-lambda');
// const chromium = require('@sparticuz/chromium');
import { ClimbersService } from '../climbers/climbers.service';
import puppeteer from 'puppeteer';

import { IClimberParse } from './scraping.interfaces';
import {
  ALLCLIMB_URL,
  // LOCAL_CHROME_EXECUTABLE,
  BUTTON_MORE_SELECTOR,
} from './scraping.constants';
import { filterRoutes, parseClimberInfo } from './scraping.utils';

// chromium.setHeadlessMode = false;

const LOAD_DELAY = 2000;

@Injectable()
export class ScrapingService {
  constructor(private climbersService: ClimbersService) {}

  private async delay(time: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  async getClimberById(id: string): Promise<IClimberParse> {
    let browser;
    try {
      // const executablePath =
      //   (await chromium.executablePath) || LOCAL_CHROME_EXECUTABLE;

      console.log('here1', await chromium.executablePath);
      browser =  await puppeteer.launch({
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
        // executablePath,
        // headless: !executablePath.includes('local'), // Используем headless только если не локальный Chrome
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process',
          '--disable-features=WebAuthentication',
          '--disable-webauthn',
          '--disable-blink-features=WebAuthenticationAPI',
          '--disable-blink-features=InterestCohortAPI',
          '--disable-features=WebAuthenticationCable',
          '--flag-switches-begin',
          '--flag-switches-end'
        ],
        // ignoreDefaultArgs: ['--disable-extensions']
      });

      console.log('here2');
      const [page] = await browser.pages();
      await page.setViewport({ width: 1280, height: 800 });

      // Не грузить картинки для ускорения загрузки
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const blockedResources = ['image', 'stylesheet', 'font', 'media'];
        if (blockedResources.includes(req.resourceType())) {
          req.abort();
        } else {
          req.continue();
        }
      });

      console.log('here3');
      // Переход на страницу скалолаза
      await page.goto(`${ALLCLIMB_URL}/${id}`, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      // Получение имени скалолаза 
      const climberInfo = await page.$eval(
        '.climber-info-block > p',
        (el) => el.textContent?.trim() || '',
      );
      const { name, routesCount } = parseClimberInfo(climberInfo);

      const existedUser = await this.climbersService.findOneByAllclimbId(Number(id));
      // if (existedUser?.routesCount && routesCount === existedUser.routesCount) return {};
      console.log('existedUser.routesCount>', existedUser?.routesCount)
      console.log('routesCount>', routesCount)

      // Функция для извлечения маршрутов
      const getRoutes = async (): Promise<any[]> => {
        return await page.$$eval('.news-preview', (elements) => {
          return elements.map((el) => {
            const titleEl = el.querySelector('.news-preview-title');
            const allText = titleEl?.textContent?.trim() || '';
            const gradeEl = el.querySelector('h4');
            const nameEl = el.querySelector('b');
            const dateEl = el.querySelector('.news-preview-date');

            return {
              isBoulder: allText.includes('Боулдер'),
              isTopRope: allText.includes('Верхняя страховка.'),
              grade: gradeEl?.textContent?.trim() || '',
              name: nameEl?.textContent?.trim() || '',
              date: dateEl?.textContent?.trim() || '',
              text: allText,
            };
          });
        });
      };

      let result = await getRoutes();
      let previousLength = 0;

      // Клик по кнопке "Еще" до тех пор, пока загружаются новые элементы
      while (result.length > previousLength) {
        previousLength = result.length;

        const button = await page.$(BUTTON_MORE_SELECTOR);
        if (!button) break;

        try {
          await button.click();
          // Ожидание скрытия и появления контейнера (индикатор загрузки)
          await page.waitForSelector('#wall', { visible: true, timeout: 5000 }).catch(() => {});
          await page.waitForSelector('#wall', { visible: false, timeout: 10000 });
          await this.delay(LOAD_DELAY);

          result = await getRoutes();
        } catch (error) {
          console.warn('Ошибка при загрузке дополнительных маршрутов:', error);
          break;
        }
      }

      console.log('routes:', result);

      return {
        name,
        routesCount: Number(routesCount),
        ...filterRoutes(result),
      };
    } catch (error) {
      console.error('Ошибка при парсинге данных скалолаза:', error);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}
