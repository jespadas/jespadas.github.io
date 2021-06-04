import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../../public/locales/en/translation';
import fr from '../../public/locales/fr/translation';
import es from '../../public/locales/es/translation';
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en,
      fr,
      es,
    },
    fallbackLng: 'en',
    debug: true,
    ns: ['translations'],
    defaultNS: 'translations',
    keySeparator: false,
    interpolation: {
      escapeValue: false,
      formatSeparator: ',',
    },
    react: {
      wait: true,
    },
  });
export default i18n;