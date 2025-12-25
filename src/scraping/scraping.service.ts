import { BadRequestException, Injectable } from '@nestjs/common';
import * as playwright from 'playwright-core';
import { ClimbersService } from '../climbers/climbers.service';
import { IClimberParse, IErrorParse } from './scraping.interfaces';
import {
  ALLCLIMB_URL,
  BUTTON_MORE_SELECTOR,
} from './scraping.constants';
import { parseRoutesData, parseClimberInfo, checkDiskSpace, logMemoryUsage, cleanupTempDir, diagnoseError } from './scraping.utils';

const chromium = require('@sparticuz/chromium');

const LOAD_DELAY = 2000;

@Injectable()
export class ScrapingService {
  constructor(private climbersService: ClimbersService) {}

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getClimberById(id: string): Promise<IClimberParse | IErrorParse> {
    let browser;
    let context;
    try {
      const startTime = Date.now();

      // Проверяем доступное место перед началом работы
      checkDiskSpace();
      logMemoryUsage();
    
      // Очищаем временные файлы от предыдущих запусков
      await cleanupTempDir();

      const executablePath = process.env.VERCEL 
        ? await chromium.executablePath()
        : playwright.chromium.executablePath();
      
      console.log(`Запускаем Playwright браузер (${executablePath})...`);
      
      browser = await playwright.chromium.launch({
        executablePath,
        headless: true, // Используйте false для отладки
        args: [
          '--no-sandbox',                    // Отключает sandbox-защиту Chromium. Полезно в изолированных средах (например, Docker), где sandbox может вызывать проблемы. ⚠️ Опасно в ненадёжных окружениях.
          '--disable-setuid-sandbox',        // Отключает setuid sandbox, который иногда несовместим с контейнерами.
          '--disable-dev-shm-usage',         // Заставляет использовать временные файлы вместо /dev/shm, что полезно при ограниченной памяти в Docker (по умолчанию /dev/shm маленький).
          '--disable-gpu',                   // Отключаеsт GPU-ускорение. Уменьшает потребление памяти и предотвращает ошибки в headless-режиме (где нет графического интерфейса).
          '--single-process',                // Запускает весь браузер в одном процессе. Экономит память, но может снизить стабильность (падение одного таба — падение всего браузера).
          '--disable-web-security',          // Отключает политику одинакового происхождения (same-origin policy). Полезно для тестов, но ⚠️ делает браузер уязвимым к XSS и другим атакам.
          '--disable-features=IsolateOrigins,site-per-process', // Отключает изоляцию происхождений и режим "по сайту — отдельный процесс", что может помочь обойти некоторые CORS-ограничения.
        ],
      });

      console.log('Браузер запущен, создание context и page...');
      context = await browser.newContext({
        viewport: { width: 1280, height: 800 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      });
      
      const page = await context.newPage();
      logMemoryUsage();

      // Блокировка ресурсов для ускорения
      await page.route('**/*', (route) => {
        const resourceType = route.request().resourceType();
        const blockedResources = ['image', 'stylesheet', 'font', 'media'];
        if (blockedResources.includes(resourceType)) {
          route.abort();
        } else {
          route.continue();
        }
      });

      console.log('Переход на страницу скалолаза...');
      // Переход на страницу скалолаза
      await page.goto(`${ALLCLIMB_URL}/ru/climber/${id}`, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });

      const h1WithError = await page.locator('h1:text-is("Server Error (500)")').first();
      if (await h1WithError.count()) {
        throw new Error(`Скалолаз с allclimbId ${id} отсутствует на Allclimb`);
      }

      // Получение имени скалолаза 
      const climberInfo = await page.textContent('.climber-info-block > p');
      const trimmedInfo = climberInfo?.trim() || '';
      const { name, routesCount, scores } = parseClimberInfo(trimmedInfo);

      const existedUser = await this.climbersService.findOneByAllclimbId(Number(id));
      console.log('Скалолаз: ', {
        allClimbId: id,
        name,
        leadsCount: existedUser?.leads.length,
        bouldersCount: existedUser?.boulders.length,
        routesCount,
        scores,
        prevRoutesCount: existedUser?.routesCount,
      });
      // if (existedUser && existedUser.routesCount === routesCount && (existedUser.leads.length + existedUser.boulders.length >= routesCount)) {
      //   return {
      //     message: `Allclimb ${id} не требует обновления`,
      //   };
      // }

      if(!routesCount) {
        console.log('Скалолаз без пролазов');
        return {
          name,
          routesCount,
          scores,
          leads: [],
          boulders: [],
        };
      }

      // Функция для извлечения числа маршрутов
      const getRoutesCount = async (): Promise<number> => {
        return await page.$$eval('.news-preview', (elements) => {
          return elements.length;
        });
      };

      // Функция для извлечения текста маршрутов и даты пролаза
      const getRoutes = async (): Promise<any[]> => {
        return await page.$$eval('.news-preview', (elements) => {
          return elements.map((el) => {
            const titleEl = el.querySelector('.news-preview-title');
            const allText = titleEl?.textContent?.trim() || '';
            const gradeEl = el.querySelector('h4');
            const dateEl = el.querySelector('.news-preview-date');
            return {
              grade: gradeEl?.textContent?.trim() || '',
              date: dateEl?.textContent?.trim() || '',
              text: allText,
            };
          });
        });
      };

      let result;
      let parsedCount = await getRoutesCount();
      let prevParsedCount = 0;
      let attempts = 0;
      const maxAttempts = 200; // Защита от бесконечного цикла

      // Клик по кнопке "Еще" до тех пор, пока загружаются новые элементы
      while (parsedCount > prevParsedCount && attempts < maxAttempts) {
        prevParsedCount = parsedCount;
        attempts++;

        const button = await page.$(BUTTON_MORE_SELECTOR);
        if (!button) {
          console.log('Кнопка "Еще" больше не найдена.');
          break;
        }

        // Проверяем, не отключена ли кнопка
        const isDisabled = await button.evaluate((btn) => (btn as HTMLButtonElement).disabled);
        if (isDisabled) {
          console.log('Кнопка "Еще" отключена.');
          break;
        }

        try {
          // Playwright лучше обрабатывает клики с ожиданием
          await button.click({ timeout: 5000 });
          
          // Ожидание загрузки новых элементов
          await this.delay(LOAD_DELAY);

          try {
            await page.waitForSelector(`${BUTTON_MORE_SELECTOR}:not(:disabled)`, { 
              timeout: 5000,
              state: 'attached'
            });
          } catch {
            // Кнопка могла стать недоступной
          }

          parsedCount = await getRoutesCount();
          // for debugging
          // console.log(`${attempts} итерация загрузки - всего загруженно ${parsedCount} пролазов`);
          
          // Если количество элементов не изменилось, подождем немного и распарсим данные
          if (parsedCount === prevParsedCount) {
            await page.waitForTimeout(1000);
            result = await getRoutes();
          }
        } catch (error) {
          console.warn('Ошибка при загрузке дополнительных маршрутов:', diagnoseError(error, context));
          break;
        }
      }

      const { leads, boulders } = parseRoutesData(result);

      const endTime = Date.now();
      const durationInSeconds = ((endTime - startTime) / 1000 / 60).toFixed(1);
      console.log(`пролазов загруженно: ${result.length} после ${attempts} итераций за ${durationInSeconds} минут`);
      return {
        name,
        routesCount,
        scores,
        leads,
        boulders,
      };
    } catch (error) {
      throw new BadRequestException(
        'Ошибка парсинга данных скалолаза на Allclimb: ' + error,
      );
    } finally {
      if (context) {
        await context.close().catch(console.error);
      }
      if (browser) {
        await browser.close().catch(console.error);
      }
    }
  }
}
