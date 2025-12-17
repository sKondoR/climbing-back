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

export const parseRoutesData = (routes: IParsedRoute[]): { leads: IRoutes, boulders: IRoutes } => {
  const leadsMap = new Map();
  const bouldersMap = new Map();
  const leads = [];
  const boulders = [];
  if (!routes) return { leads, boulders };
  for (const route of routes) {
    const rows = route.text.replaceAll('  ', '').split('.');
    // for debudding
    console.log('parseRoutesData for: ', route.text, rows);
    const name = rows[0].trim();
    const grade = rows[1].trim();
    const isBoulder = route.text.includes(PARSING_WORDS.BOLDER_WORD);
    const isTopRope = route.text.includes(PARSING_WORDS.TOP_ROPE);

    const map = isBoulder ? bouldersMap : leadsMap;
    const arr = isBoulder ? boulders : leads;
    const region = parseClimbRegion(route.text);
    const key = `${name}|${grade}|${region}`;

    if (!map.has(key)) {
      map.set(key, true);
      arr.push({
        name,
        grade,
        isBoulder,
        isTopRope,
        region,
        date: route.date
      });
    }
  }

  return { leads, boulders };
};
