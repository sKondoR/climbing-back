import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as playwright from 'playwright-core';

import { CreateRouteImgDto } from './dto/create-route-img.dto';
import { UpdateRouteImgDto } from './dto/update-route-img.dto';
import { RouteImgEntity } from './entities/route-img.entity';
import { ALLCLIMB_URL } from 'src/scraping/scraping.constants';
import { IRouteImg, ISearchRoute } from './route-imgs.interfaces';
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
    console.log('Скриншот сохранён с ID:', routeImg.id);
    return await this.routeImgsRepository.save(routeImg);
  }

  async findAll(): Promise<RouteImgEntity[]> {
    return await this.routeImgsRepository.find();
  }

  async findOne(id: string): Promise<IRouteImg> {
    const saved = await this.routeImgsRepository.findOne({ where: { id } });
    console.log('here', id, saved);
    // сохранение локально
    require('fs').writeFileSync('downloaded.png', saved.imageData);
    if (saved) {
      return saved; // Buffer → файл
    }
    return await this.routeImgsRepository.findOne({ where: { id } });
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

  async remove(id: number): Promise<void> {
    await this.routeImgsRepository.delete(id);
  }

  async getRouteImgByName(route: ISearchRoute): Promise<IRouteImg> {
    let browser;
    let context;
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
        viewport: { width: 1280, height: 800 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      });
      
      const page = await context.newPage();
      logMemoryUsage();

      // Блокировка ресурсов для ускорения
      await page.route('**/*', (route) => {
        const resourceType = route.request().resourceType();
        // const blockedResources = ['image', 'stylesheet', 'font', 'media'];
        const blockedResources = ['font', 'media'];
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
      console.log('Переход на страницу с полем поиска...');
      await page.fill('#searchfor', route.name);
      await page.press('#searchfor', 'Enter');

      // выбираем ссылку содержащую название базового региона
      const baseRegion = route.region.split('.')[0].trim();
      console.log('baseRegion>', `(${baseRegion})`);
      await page.click(`a:has-text('${route.name}'):has-text('${baseRegion}')`);

      // ждём, пока все сетевые запросы не завершатся
      await page.waitForLoadState('networkidle')

      const routeButton = await page.locator('.items-preview').filter({ hasText: route.name });
      if (!routeButton) {
        console.log('Кнопка трассы не найдена');
      }
      console.log('Кнопка трассы найдена', routeButton);

      // Наведение на элемент
      // await page.hover(`.items-preview-route-title:has-text('${route.name}')`);
      await page.click(`.items-preview-route-title:has-text('${route.name}')`);
      await page.waitForLoadState('networkidle');

      const imageUrl = await page.locator('.route-portrait img').getAttribute('src');
      console.log(imageUrl);

      // Возвращаемся на предыдущую страницу
      await page.goBack();
      await page.waitForLoadState('networkidle');

      // Наведение на элемент
      await page.hover(`.items-preview-route-title:has-text('${route.name}')`);

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
      });

      return {
        id: `${route.name}`,
        url: '',
        imgUrl: '',
        imageData: screenshotBuffer,
      };
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

  // async function addTextToJpg() {
  //   const image = await loadImage('input.jpg');
  //   const canvas = createCanvas(image.width, image.height);
  //   const ctx = canvas.getContext('2d');

  //   // Draw the original image
  //   ctx.drawImage(image, 0, 0);

  //   // Set text styles
  //   ctx.font = '40px Arial';
  //   ctx.fillStyle = 'red';
  //   ctx.strokeStyle = 'black';
  //   ctx.lineWidth = 2;
  //   ctx.fillText('Hello, World!', 50, 100);
  //   ctx.strokeText('Hello, World!', 50, 100); // for stroke

  //   // Save result as JPG
  //   const buffer = canvas.toBuffer('image/jpeg');
  //   fs.writeFileSync('output.jpg', buffer);
  //   console.log('Saved with text: output.jpg');
  // }
}
