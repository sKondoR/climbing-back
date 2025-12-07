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
import { memoryUsage } from 'process';


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
      // Фильтруем только временные файлы браузера (Chromium)
      // Важно: не удаляем системные файлы, только браузерные
      if (file.includes('core.chromium')) {
        const filePath = path.join(tempDir, file);
        
        try {
          // Удаляем файл
          // await fs.promises.unlink(filePath);
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

@Injectable()
export class ScrapingService {
  constructor(private climbersService: ClimbersService) {}

  /**
   * Проверяет доступное дисковое пространство
   * @returns {number} Количество свободных МБ
   * @throws {Error} Если памяти меньше 100МБ
   */
  private checkDiskSpace() {
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

  private async delay(time: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  private async logMemoryUsage() {
    // Check for memory issues
    if (process.memoryUsage) {
      const memory = process.memoryUsage();
      const memoryUsage = {
        heapUsed: Math.round(memory.heapUsed / 1024 / 1024) + 'MB',
        heapTotal: Math.round(memory.heapTotal / 1024 / 1024) + 'MB',
        rss: Math.round(memory.rss / 1024 / 1024) + 'MB'
      };
      console.log('memoryUsage: ', memoryUsage);
    }
    return memoryUsage;
  }

  private async diagnoseError(error, context) {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      errorMessage: error.message,
      checks: {
        browserConnected: undefined,
        contextClosed: undefined,
        memoryUsage: undefined,
        pagesCount: undefined,
      }
    };

    // Check 1: Is browser connected?
    if (context.browser) {
      diagnostics.checks.browserConnected = context.browser().isConnected();
    }

    // Check 2: Is context closed?
    if (context.isClosed) {
      diagnostics.checks.contextClosed = await context.isClosed();
    }

    // Check 3: Check for memory issues
    if (process.memoryUsage) {
      diagnostics.checks.memoryUsage = this.logMemoryUsage;
    }

    // Check 4: Check for too many pages
    if (context.pages) {
      diagnostics.checks.pagesCount = context.pages().length;
    }

    console.error('Диагностика:', JSON.stringify(diagnostics, null, 2));
    return diagnostics;
  }

  async getClimberById(id: string): Promise<IClimberParse> {
  let browser;
  try {

    // Проверяем доступное место перед началом работы
    this.checkDiskSpace();
    this.logMemoryUsage();
  
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
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
    
    const page = await context.newPage();
    this.logMemoryUsage();

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
    await page.goto(`${ALLCLIMB_URL}/${id}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // Получение имени скалолаза 
    const climberInfo = await page.textContent('.climber-info-block > p');
    const trimmedInfo = climberInfo?.trim() || '';
    const { name, routesCount } = parseClimberInfo(trimmedInfo);

    const existedUser = await this.climbersService.findOneByAllclimbId(Number(id));
    console.log('Скалолаз: ', {
      allClimbId: id,
      name,
      routesCount,
      prevRoutesCount: existedUser?.routesCount,
    });

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
          console.warn('Ошибка при загрузке дополнительных маршрутов:', this.diagnoseError(error, context));
          break;
        }
      }

      console.log(`Пролазов загруженно: ${result.length} после ${attempts} попыток`);

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
