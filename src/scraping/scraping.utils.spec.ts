import { IRoutes } from 'src/climbers/climbers.interfaces';
import { filterRoutes, parseClimberInfo, parseClimbRegion } from './scraping.utils';

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




describe('scraping.utils/filterRoutes', () => {
  it('должен фильтровать и разделять маршруты на лиды и боулдеры', () => {
    const routes: IRoutes = [
      { name: 'Маршрут 1', grade: '6a', text: 'Спорт.Крым', isBoulder: false },
      { name: 'Маршрут 2', grade: '7a', text: 'Боулдер.Адыгея', isBoulder: true },
      { name: 'Маршрут 3', grade: '6b', text: 'Спорт.Крым', isBoulder: false },
    ] as IRoutes;

    const result = filterRoutes(routes);

    expect(result.leads).toHaveLength(2);
    expect(result.boulders).toHaveLength(1);
    expect(result.leads[0].region).toBe('Крым');
    expect(result.boulders[0].region).toBe('Адыгея');
  });

  it('должен удалять дубликаты по ключу name|grade|text', () => {
    const routes: IRoutes = [
      { name: 'Маршрут', grade: '6a', text: 'Спорт.Крым', isBoulder: false },
      { name: 'Маршрут', grade: '6a', text: 'Спорт.Крым', isBoulder: false }, // дубль
      { name: 'Боулдер', grade: '7a', text: 'Боулдер.Адыгея', isBoulder: true },
      { name: 'Боулдер', grade: '7a', text: 'Боулдер.Адыгея', isBoulder: true }, // дубль
    ] as IRoutes;

    const result = filterRoutes(routes);

    expect(result.leads).toHaveLength(1);
    expect(result.boulders).toHaveLength(1);
  });

  it('должен корректно работать с пустым массивом', () => {
    const result = filterRoutes([]);
    expect(result.leads).toHaveLength(0);
    expect(result.boulders).toHaveLength(0);
  });

  it('должен обрабатывать маршруты без текста', () => {
    const routes: IRoutes = [
      { name: 'Маршрут', grade: '6a', text: '', isBoulder: false },
    ] as IRoutes;

    const result = filterRoutes(routes);

    expect(result.leads[0].region).toBe('');
  });
});
