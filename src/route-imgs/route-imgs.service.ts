import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as playwright from 'playwright-core';

import { CreateRouteImgDto } from './dto/create-route-img.dto';
import { UpdateRouteImgDto } from './dto/update-route-img.dto';
import { RouteImgEntity } from './entities/route-img.entity';
import { ALLCLIMB_URL } from 'src/scraping/scraping.constants';
import { IRouteImg, IRouteImgError, ISearchRoute } from './route-imgs.interfaces';
import { checkDiskSpace, cleanupTempDir, logMemoryUsage } from 'src/scraping/scraping.utils';

const chromium = require('@sparticuz/chromium');

@Injectable()
export class RouteImgsService {
  constructor(
    @InjectRepository(RouteImgEntity)
    private routeImgsRepository: Repository<RouteImgEntity>,
  ) {}

  async create(createRouteImgsDto: CreateRouteImgDto): Promise<RouteImgEntity> {
    const routeImg = new RouteImgEntity();
    routeImg.id = createRouteImgsDto.id;
    routeImg.url = createRouteImgsDto.url;
    routeImg.imgUrl = createRouteImgsDto.imgUrl;
    routeImg.imageData = createRouteImgsDto.imageData;
    routeImg.error = createRouteImgsDto.error;
    return await this.routeImgsRepository.save(routeImg);
  }

  // async findAll(): Promise<RouteImgEntity[]> {
  //   return await this.routeImgsRepository.find();
  // }

  async findOne(id: string): Promise<IRouteImg | IRouteImgError> {
    const saved = await this.routeImgsRepository.findOne({ where: { id } });
    if (saved) {
      return saved;
    }
    const routeImg = await this.getRouteImgByName({
      name: id.split('-')[0],
      region: id.split('-')[1],
    });
    await this.create(routeImg);
    return routeImg;
  }

  // async findOneByAllclimbId(allClimbId: number): Promise<RouteImgEntity> {
  //   return await this.routeImgsRepository.findOne({ where: { allClimbId } });
  // }

  async update(
    id: string,
    updateRouteImgDto: UpdateRouteImgDto,
  ): Promise<RouteImgEntity> {
    const routeImg = await this.routeImgsRepository.findOne({ where: { id } });
    if (!routeImg) {
      throw new NotFoundException('Route image not found');
    }
    routeImg.id = updateRouteImgDto.id;
    routeImg.url = updateRouteImgDto.url;
    routeImg.imgUrl = updateRouteImgDto.imgUrl;
    routeImg.imageData = updateRouteImgDto.imageData;
    await this.routeImgsRepository.update({ id }, routeImg);
    return routeImg;
  }

  // async remove(id: number): Promise<void> {
  //   await this.routeImgsRepository.delete(id);
  // }

  async getRouteImgByName(route: ISearchRoute): Promise<IRouteImg | IRouteImgError> {
    let browser;
    let context;

    const id = `${route.name}-${route.region}`;
    const routeImg = await this.routeImgsRepository.findOne({ where: { id } });
    if (routeImg?.error || routeImg?.imageData) {
      return routeImg;
    }
    
    try {
      // const startTime = Date.now();

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
        headless: false, // Используйте false для отладки
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
        viewport: { width: 1800, height: 900 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      });
      
      const page = await context.newPage();
      logMemoryUsage();

      // Блокировка ресурсов для ускорения
      await page.route('**/*', (route) => {
        const resourceType = route.request().resourceType();
        // const blockedResources = ['image', 'stylesheet', 'font', 'media'];
        const blockedResources = [];
        if (blockedResources.includes(resourceType)) {
          route.abort();
        } else {
          route.continue();
        }
      });

      console.log('Переход на страницу с полем поиска...');
      // Переход на страницу с полем поиска
      await page.goto(`${ALLCLIMB_URL}/ru/guides/`, {
        waitUntil: 'domcontentloaded',
        timeout: 10000,
      });

      // заполняем автокомплит поиска именем трассы
      await page.fill('#searchfor', route.name);
      await page.press('#searchfor', 'Enter');

      // выбираем ссылку содержащую название базового региона
      const baseRegion = route.region.split('.')[0].trim();
      console.log('Переход на страницу трассы...');
      // для отладки
      console.log('debug: ', route.name, ' / ', baseRegion);
      // :not([href*="OLD"]) некоторые сектора имеют OLD в ссылке - это старые фото
      // await page.click(`a:has-text('${route.name}'):has-text('${baseRegion}'):not([href*="OLD"])`);
      await page
        .locator('a')
        .filter({ hasText: route.name }) 
        .filter({ hasText: baseRegion })
        .filter({ has: page.locator(':not([href*="OLD"])') })
        .first() 
        .click({ force: true });


      // ждём, пока все страница не загрузится
      await page.waitForLoadState('domcontentloaded');

      const errorLocator = page.getByText(/Server Error \(500\)/);
      if (await errorLocator.count()) {
        return {
          id,
          error: 'Изображение трассы недоступно на AllClimb',
        };
      }

      await page.waitForTimeout(500);
      // Наведение на элемент
      await page
        .locator('.items-preview')
        .filter({ hasText: route.name })
        .first()
        .click({ force: true });
      await page.waitForLoadState('domcontentloaded');

      const url = page.url();
      const parsedImageUrl = await page.locator('.route-portrait img')
        .getAttribute('src');

      const imageUrl = parsedImageUrl.replace('.JPG', '.jpg')
      console.log(imageUrl);

      // Возвращаемся на предыдущую страницу
      await page.goBack();
      await page.waitForLoadState('domcontentloaded');

      // Наведение на элемент
      await page
        .locator('.items-preview')
        .filter({ hasText: route.name })
        .first()
        .hover();
      // иногда ховер не успевает сработать без ожидания
      await page.waitForTimeout(1500);

      const imgLocator = page.locator(`img[src*="${imageUrl.split('.jpg')[0]}"]`);
      const imgBox = await imgLocator.boundingBox();
      if (!imgBox) {
        throw new Error('Не удалось получить координаты изображения');
      }
      const screenshotBox = {
        x: imgBox.x, 
        y: imgBox.y,  
        width: imgBox.width,
        height: Math.max(1, imgBox.height - 20),
      };

      const screenshotBuffer = await page.screenshot({
        encoding: 'binary',
        clip: screenshotBox,
        type: 'jpeg',
      });

      const routeImg = {
        id,
        url,
        imgUrl: imageUrl,
        imageData: screenshotBuffer,
      };

      return routeImg;
    } catch (error) {
      throw new BadRequestException(
        'Ошибка парсинга изображения трассы на Allclimb: ' + error,
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
