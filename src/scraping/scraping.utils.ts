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
