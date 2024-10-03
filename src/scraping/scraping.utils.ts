export const parseClimberName = (text) => {
  const result = text.replaceAll('  ', '');
  return result.slice(0, result.indexOf('\n'));
};

const findSameRoute = (arr, route) =>
  arr.some((a) => a.name === route.name && a.grade === route.grade);

export const filterRoutes = (routes) =>
  routes.reduce(
    (acc, route) => {
      if (route.isBoulder && !findSameRoute(acc.boulders, route)) {
        acc.boulders.push(route);
      }
      if (!route.isBoulder && !findSameRoute(acc.leads, route)) {
        acc.leads.push(route);
      }
      return acc;
    },
    {
      leads: [],
      boulders: [],
    },
  );
