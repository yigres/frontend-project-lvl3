import en from './translations/en.json';

export const initialState = {
  form: {
    state: {
      url: null,
      status: null,
    },
  },
  feeds: [],
  posts: [],
};

export const i18nOptions = {
  lng: 'en',
  debug: true,
  resources: {
    en: {
      translation: en,
    },
  },
};
