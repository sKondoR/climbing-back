import {
  ROUTE_NAME_SELECTOR,
  ROUTE_GRADE_SELECTOR,
  ROUTE_DATE_SELECTOR,
} from './scraping.constants';

export const parseRoute = (el) => ({
  isBoulder: el.textContent.includes('Боулдер'),
  grade: el.querySelector(ROUTE_GRADE_SELECTOR).textContent.trim(),
  name: el.querySelector(ROUTE_NAME_SELECTOR).textContent.trim(),
  date: el.querySelector(ROUTE_DATE_SELECTOR).textContent.trim(),
});

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
