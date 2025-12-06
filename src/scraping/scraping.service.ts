import { Injectable } from '@nestjs/common';
import * as playwright from 'playwright-core';
const chromium = require('@sparticuz/chromium');
import { ClimbersService } from '../climbers/climbers.service';
import { IClimberParse } from './scraping.interfaces';
import {
  ALLCLIMB_URL,
  // LOCAL_CHROME_EXECUTABLE,
  BUTTON_MORE_SELECTOR,
} from './scraping.constants';
import { filterRoutes, parseClimberInfo } from './scraping.utils';
const os = require('os');
const fs = require('fs');
const path = require('path');


const LOAD_DELAY = 2000;

/**
 * Очищает временные файлы браузера из системного temp-каталога
 * Это критически важно для serverless-сред, где дисковое пространство ограничено
 */
async function cleanupTempDir() {
  // Получаем системный временный каталог (в Lambda это /tmp)
  const tempDir = os.tmpdir();
  
  try {
    // Читаем все файлы в temp-каталоге
    const files = await fs.promises.readdir(tempDir);
    
    // Проходим по всем файлам
    for (const file of files) {
      // Фильтруем только временные файлы браузера (Puppeteer/Chromium)
      // Важно: не удаляем системные файлы, только браузерные
      if (file.startsWith('puppeteer') || file.startsWith('chromium')) {
        const filePath = path.join(tempDir, file);
        
        try {
          // Удаляем файл
          await fs.promises.unlink(filePath);
          console.log(`Удален временный файл: ${filePath}`);
        } catch (e) {
          // Логируем, но не прерываем выполнение при ошибке удаления
          console.warn(`Не удалось удалить ${filePath}:`, e.message);
        }
      }
    }
  } catch (error) {
    // Если не можем прочитать каталог, логируем ошибку
    console.error('Ошибка при очистке временного каталога:', error);
  }
}

/**
 * Проверяет доступное дисковое пространство
 * @returns {number} Количество свободных МБ
 * @throws {Error} Если памяти меньше 100МБ
 */
function checkDiskSpace() {
  // Получаем информацию о памяти
  const freeMB = os.freemem() / (1024 * 1024);
  const totalMB = os.totalmem() / (1024 * 1024);
  
  // Логируем состояние памяти для отладки
  console.log(`Память: ${freeMB.toFixed(0)}МБ свободно из ${totalMB.toFixed(0)}МБ`);
  
  // Бросаем ошибку, если памяти слишком мало (меньше 100МБ)
  // Это предотвратит краш из-за нехватки памяти
  if (freeMB < 100) {
    throw new Error(`Недостаточно памяти: осталось всего ${freeMB.toFixed(0)}МБ`);
  }
  
  return freeMB;
}

@Injectable()
export class ScrapingService {
  constructor(private climbersService: ClimbersService) {}

  private async delay(time: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  async getClimberById(id: string): Promise<IClimberParse> {
  let browser;
  try {

      // Проверяем доступное место перед началом работы
  checkDiskSpace();
  
  // Очищаем временные файлы от предыдущих запусков
  await cleanupTempDir();

    console.log('Starting Playwright browser...');

    const executablePath = process.env.VERCEL 
      ? await chromium.executablePath()
      : playwright.chromium.executablePath();
    
    console.log('executablePath: ', executablePath);
    
    browser = await playwright.chromium.launch({
      executablePath,
      headless: true, // Используйте false для отладки
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-webauthn',
      ],
    });

    console.log('Browser launched, creating context and page...');
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
    
    const page = await context.newPage();

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

    console.log('Navigating to climber page...');
    // Переход на страницу скалолаза
    await page.goto(`${ALLCLIMB_URL}/${id}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // Получение имени скалолаза 
    const climberInfo = await page.textContent('.climber-info-block > p');
    const trimmedInfo = climberInfo?.trim() || '';
    const { name, routesCount } = parseClimberInfo(trimmedInfo);

    const existedUser = await this.climbersService.findOneByAllclimbId(Number(id));
    console.log('existedUser.routesCount>', existedUser?.routesCount);
    console.log('routesCount>', routesCount);

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
    let attempts = 0;
    const maxAttempts = 50; // Защита от бесконечного цикла

    // Клик по кнопке "Еще" до тех пор, пока загружаются новые элементы
    while (result.length > previousLength && attempts < maxAttempts) {
      previousLength = result.length;
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

        result = await getRoutes();
        
        // Если количество элементов не изменилось, подождем немного
        if (result.length === previousLength) {
          await page.waitForTimeout(1000);
          result = await getRoutes();
        }
        
      } catch (error) {
        console.warn('Ошибка при загрузке дополнительных маршрутов:', error);
        break;
      }
    }

    console.log(`Total routes loaded: ${result.length} after ${attempts} attempts`);

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
