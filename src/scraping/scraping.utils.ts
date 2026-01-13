const os = require('os');
const fs = require('fs');
const path = require('path');

import { IRoutes, IParsedRoute } from 'src/climbers/climbers.interfaces';
import { PARSING_WORDS } from './scraping.constants';

interface IParseClimberInfo {
  name: string,
  routesCount: number,
  scores: number,
}

export const parseClimberInfo = (text: string): IParseClimberInfo => {
  const rows = text.replaceAll('  ', '').split('\n');
  return  {
    name: rows[0],
    routesCount: rows[2] ? Number(rows[2]?.replace(PARSING_WORDS.COUNT, '')) : NaN,
    scores: rows[4] ? Number(rows[4]?.replace(PARSING_WORDS.SCORES, '')) : NaN,
  };
};

export const parseClimbRegion = (text: string): string => {
  if (!text) return '';
  const { LEAD_WORD, BOLDER_WORD, MULTI, TOP_ROPE } = PARSING_WORDS;
  const formatted = text.replaceAll('\n', '');
  const posLead = formatted.indexOf(LEAD_WORD);
  const posBold = formatted.indexOf(BOLDER_WORD);
  const posMulti = formatted.indexOf(MULTI);
  const posTopRope = formatted.indexOf(TOP_ROPE);
  let posEnd = 0;
  if (posLead !== -1) {
    posEnd = posLead + LEAD_WORD.length;
  }
  if (posBold !== -1) {
    posEnd = posBold + BOLDER_WORD.length;
  }
  if (posMulti !== -1) {
    posEnd = posMulti + MULTI.length;
  }
  if (posTopRope !== -1) {
    posEnd = posTopRope + TOP_ROPE.length;
  }
  return formatted.substring(posEnd).trim();
};

export const parseRoutesData = (routes: IParsedRoute[]): { leads: IRoutes, boulders: IRoutes } => {
  const leadsMap = new Map();
  const bouldersMap = new Map();
  const leads = [];
  const boulders = [];
  if (!routes) return { leads, boulders };
  for (const route of routes) {
    const rows = route.text.replaceAll('&nbsp;', ' ').split('.');
    // for debudding
    console.log('parseRoutesData for: ', route.text, rows);
    const name = rows[0].trim();
    const isBoulder = route.text.includes(PARSING_WORDS.BOLDER_WORD);
    const isTopRope = route.text.includes(PARSING_WORDS.TOP_ROPE);

    const map = isBoulder ? bouldersMap : leadsMap;
    const arr = isBoulder ? boulders : leads;
    const region = parseClimbRegion(route.text);
    const key = `${name}|${route.grade}|${region}`;

    if (!map.has(key)) {
      map.set(key, true);
      arr.push({
        name,
        grade: route.grade,
        isBoulder,
        isTopRope,
        region,
        date: route.date
      });
    }
  }

  return { leads, boulders };
};


/**
 * Очищает временные файлы Chromium из /tmp (важно для serverless)
 */
export const cleanupTempDir = async () => {
  // Получаем системный временный каталог (в Lambda это /tmp)
  const tempDir = os.tmpdir();
  
  try {
    // Читаем все файлы в temp-каталоге
    const files = await fs.promises.readdir(tempDir);
    const removedFiles = [];

    // Проходим по всем файлам
    for (const file of files) {
      // Фильтруем только временные файлы браузера (Chromium)
      // Важно: не удаляем системные файлы, только браузерные
      if (file.includes('core.chromium')) {
        const filePath = path.join(tempDir, file);
        try {
          // Удаляем файл
          await fs.promises.unlink(filePath);
          removedFiles.push(filePath);
        } catch (e) {
          // Логируем, но не прерываем выполнение при ошибке удаления
          console.warn(`Не удалось удалить ${filePath}:`, e.message);
        }
      }
    }
    console.log(`Удалены временные файлы: ${removedFiles.join(', ')}`);
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
export const checkDiskSpace = () => {
  // Получаем информацию о памяти
  const freeMB = os.freemem() / (1024 * 1024);
  const totalMB = os.totalmem() / (1024 * 1024);
  
  // Логируем состояние памяти для отладки
  console.log(`Память: ${freeMB.toFixed(0)}МБ свободно из ${totalMB.toFixed(0)}МБ`);
  
  // Бросаем ошибку, если памяти слишком мало (меньше 100МБ). Это предотвратит краш из-за нехватки памяти
  if (freeMB < 100) {
    throw new Error(`Недостаточно памяти: осталось всего ${freeMB.toFixed(0)}МБ`);
  }
  
  return freeMB;
}

export const logMemoryUsage = () => {
  let memoryUsage;
  // Check for memory issues
  if (process.memoryUsage) {
    const memory = process.memoryUsage();
    memoryUsage = {
      heapUsed: Math.round(memory.heapUsed / 1024 / 1024) + 'MB',
      heapTotal: Math.round(memory.heapTotal / 1024 / 1024) + 'MB',
      rss: Math.round(memory.rss / 1024 / 1024) + 'MB'
    };
    console.log('memoryUsage: ', memoryUsage);
  }
  return memoryUsage;
}

export const diagnoseError = async (error, context) => {
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
    diagnostics.checks.memoryUsage = logMemoryUsage;
  }

  // Check 4: Check for too many pages
  if (context.pages) {
    diagnostics.checks.pagesCount = context.pages().length;
  }

  console.error('Диагностика:', JSON.stringify(diagnostics, null, 2));
  return diagnostics;
}
