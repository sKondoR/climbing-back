import { parseClimberInfo } from './scraping.utils';

describe('scraping.utils', () => {

  it('should return name', () => {
    // eslint-disable-next-line prettier/prettier
    const info = 'Витя Кондрашин\n                    \n                         Пролазов в AllClimb 61\n                        \n                             Баллов 1944';
    const { name } = parseClimberInfo(info);
    expect(name).toBe('Витя Кондрашин');
  });

  it('should return count of routes', () => {
    // eslint-disable-next-line prettier/prettier
    const info = 'Витя Кондрашин\n                    \n                         Пролазов в AllClimb 61\n                        \n                             Баллов 1944';
    const { routesCount } = parseClimberInfo(info);
    expect(routesCount).toBe(61);
  });
});
