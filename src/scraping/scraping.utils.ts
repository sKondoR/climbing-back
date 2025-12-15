import { IRoutes } from 'src/climbers/climbers.interfaces';
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
  const { LEAD_WORD, BOLDER_WORD, MULTI } = PARSING_WORDS;
  const formatted = text.replaceAll('\n', '');
  const posLead = formatted.indexOf(PARSING_WORDS.LEAD_WORD);
  const posBold = formatted.indexOf(PARSING_WORDS.BOLDER_WORD);
  const posMulti = formatted.indexOf(PARSING_WORDS.MULTI);
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
  return formatted.substring(posEnd).trim();
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
