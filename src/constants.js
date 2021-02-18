import en from './translations/en.json';
import ru from './translations/ru.json';

export const proxyUrl = 'https://hexlet-allorigins.herokuapp.com';

export const i18nOptionsEn = {
  lng: 'en',
  debug: false,
  resources: {
    en: {
      translation: en,
    },
  },
};
export const i18nOptionsRu = {
  lng: 'ru',
  debug: false,
  resources: {
    ru: {
      translation: ru,
    },
  },
};
