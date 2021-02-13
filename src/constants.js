import en from './translations/en.json';

export const proxyUrl = 'https://hexlet-allorigins.herokuapp.com';

// export const initialState = {
//   form: {
//     state: {
//       url: null,
//       status: null,
//     },
//   },
//   feeds: [],
//   posts: [],
// };

export const i18nOptions = {
  lng: 'en',
  debug: false,
  resources: {
    en: {
      translation: en,
    },
  },
};
