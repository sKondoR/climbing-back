import { parseClimberName } from './scraping.utils';

describe('scraping.utils', () => {
  it('should be defined', () => {
    // eslint-disable-next-line prettier/prettier
    const name = 'Витя Кондрашин\n                    \n                         Пролазов в AllClimb 61\n                        \n                             Баллов 1944';
    expect(parseClimberName(name)).toBe('Витя Кондрашин');
  });
});
