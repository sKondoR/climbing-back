import { IRoutes } from 'src/climbers/climbers.interfaces';

const PARSING_WORDS = {
  COUNT: 'Пролазов в AllClimb',
  SCORES: 'Баллов',
  LEAD_WORD: 'Спорт.',
  BOLDER_WORD: 'Боулдер.',
  MULTI: 'Мультипитч.'
}

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

// toDo: поправить для мультипитчей
// Факирьянова Эверест 24
// 24.  8a. Мультипитч. Тырныауз. Кабардино-Балкария
export const parseClimbRegion = (text: string): string => {
  if (!text) return '';
  const { LEAD_WORD, BOLDER_WORD } = PARSING_WORDS;
  const formatted = text.replaceAll('\n', '');
  const posLead = formatted.indexOf(PARSING_WORDS.LEAD_WORD);
  const posBold = formatted.indexOf(PARSING_WORDS.BOLDER_WORD);
  const pos = posLead !== -1 ? posLead  + LEAD_WORD.length : posBold + BOLDER_WORD.length;
  return formatted.substring(pos).trim();
};

export const filterRoutes = (routes: IRoutes) => {
  const leadsMap = new Map();
  const bouldersMap = new Map();

  const getKey = (route) => `${route.name}|${route.grade}|${route.text}`;

  const leads = [];
  const boulders = [];

  for (const route of routes) {
    const key = getKey(route);
    const map = route.isBoulder ? bouldersMap : leadsMap;
    const arr = route.isBoulder ? boulders : leads;
    route.region = parseClimbRegion(route.text);

    if (!map.has(key)) {
      map.set(key, true);
      arr.push({
        ...route,
        region: parseClimbRegion(route.text)
      });
    }
  }

  return { leads, boulders };
};
