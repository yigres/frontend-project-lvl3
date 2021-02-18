import en from './translations/en.json';
import ru from './translations/ru.json';

export const proxyUrl = 'https://hexlet-allorigins.herokuapp.com';

export const i18nOptions = {
  debug: true,
  resources: { en, ru },
};
