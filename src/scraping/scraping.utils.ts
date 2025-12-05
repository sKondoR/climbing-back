export const parseClimberInfo = (text) => {
  const result = text.replaceAll('  ', '').split('\n');
  return  {
    name: result[0],
    routesCount: Number(result[2].replace('Пролазов в AllClimb ', '')),
  };
};

const findSameRoute = (arr, route) => {
  return arr.some((item) => item.name === route.name && item.grade === route.grade && item.text === route.text);
}

export const filterRoutes = (routes) => {
  const leadsMap = new Map();
  const bouldersMap = new Map();

  const getKey = (route) => `${route.name}|${route.grade}|${route.text}`;

  const leads = [];
  const boulders = [];

  for (const route of routes) {
    const key = getKey(route);
    const map = route.isBoulder ? bouldersMap : leadsMap;
    const arr = route.isBoulder ? boulders : leads;

    if (!map.has(key)) {
      map.set(key, true);
      arr.push(route);
    }
  }

  return { leads, boulders };
};
