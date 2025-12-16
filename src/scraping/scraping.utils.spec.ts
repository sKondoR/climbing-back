import { IRoutes, IParsedRoute } from 'src/climbers/climbers.interfaces';
import { parseRoutesData, parseClimberInfo, parseClimbRegion } from './scraping.utils';

describe('scraping.utils/parseClimberInfo', () => {

  it('должен корректно парсить имя, количество пролазов и баллы', () => {
    // eslint-disable-next-line prettier/prettier
    const info = 'Витя Кондрашин\n                    \n                         Пролазов в AllClimb 61\n                        \n                             Баллов 1944';
    const result = parseClimberInfo(info);
    expect(result).toEqual({
      name: 'Витя Кондрашин',
      routesCount: 61,
      scores: 1944,
    });
  });
});

describe('scraping.utils/parseClimbRegion', () => {
  it('должен извлекать регион/1', () => {
    // eslint-disable-next-line prettier/prettier
    const text = `Лестница библиотеки Лауренциана. 
                                        7a. 
                                        Боулдер. 
                                        Ренессанс. Карельский перешеек`;
    expect(parseClimbRegion(text)).toBe('Ренессанс. Карельский перешеек');
  });

  it('должен извлекать регион/2', () => {
    // eslint-disable-next-line prettier/prettier
    const text = `Monkey Business. \n
                                              8a. \n
                                              Спорт. \n
                                              Geyikbayırı. Antalya`;
    expect(parseClimbRegion(text)).toBe('Geyikbayırı. Antalya');
  });

  it('должен извлекать регион/3', () => {
    // eslint-disable-next-line prettier/prettier
    const text = `Не альпинизм. \n                   6b+. \nБоулдер. \nДжан-Туган. Кабардино-Балкария`;
    expect(parseClimbRegion(text)).toBe('Джан-Туган. Кабардино-Балкария');
  });

  it('должен извлекать регион/4', () => {
    // eslint-disable-next-line prettier/prettier
    const text = `um ışığında yemek (sağ). \n
                                            7b. \n
                                            Спорт. \n
                                            Geyikbayırı. Antalya`;
    expect(parseClimbRegion(text)).toBe('Geyikbayırı. Antalya');
  });

  it('должен извлекать регион/5', () => {
    // eslint-disable-next-line prettier/prettier
    const text = `Эверест 24. \n                   8a. \nМультипитч. \nТырныауз. Кабардино-Балкария`;
    expect(parseClimbRegion(text)).toBe('Тырныауз. Кабардино-Балкария');
  });
});


describe('scraping.utils/parseRoutesData', () => {
  it('должен фильтровать и разделять маршруты на лиды и боулдеры, удаляя дубликаты', () => {
    const parsedRoutes: IParsedRoute[] = [
      { text: 'Лестница библиотеки Лауренциана. \n     7a.  \n Боулдер.  \n Ренессанс. Карельский перешеек', date: 'дата1' },
      { text: 'Эверест 24. \n                 8a.           \nМультипитч. \n  Тырныауз. Кабардино-Балкария', date: 'дата2' },
      { text: 'Не альпинизм. \n                   6b+.    \nБоулдер.       \nДжан-Туган. Кабардино-Балкари', date: 'дата3' },
      { text: 'Monkey Business. \n     8a.       \n   Спорт. \n                    Geyikbayırı. Antalya   ', date: 'дата4' },
      { text: 'Не альпинизм. \n                   6b+.    \nБоулдер.       \nДжан-Туган. Кабардино-Балкари', date: 'дата5' },
    ];

    const result = parseRoutesData(parsedRoutes);

    expect(result.leads).toStrictEqual([
      {
        name: 'Эверест 24',
        grade: '8a',
        isBoulder: false,
        isTopRope: false,
        region: 'Тырныауз. Кабардино-Балкария',
        date: 'дата2'
      },
      {
        name: 'Monkey Business',
        grade: '8a',
        isBoulder: false,
        isTopRope: false,
        region: 'Geyikbayırı. Antalya',
        date: 'дата4'
      }
    ]);
    expect(result.boulders).toStrictEqual([
      {
        name: 'Лестница библиотеки Лауренциана',
        grade: '7a',
        isBoulder: true,
        isTopRope: false,
        region: 'Ренессанс. Карельский перешеек',
        date: 'дата1'
      },
      {
        name: 'Не альпинизм',
        grade: '6b+',
        isBoulder: true,
        isTopRope: false,
        region: 'Джан-Туган. Кабардино-Балкари',
        date: 'дата3'
      }
    ]);
  });
});
