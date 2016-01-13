import Translator from 'frontend-translator';

function implementTranslator(implementation = {}) {
  return Translator({
    defaultLocale: implementation.config.app.defaultLocale,
    locales: implementation.config.locales
  });
}

export default implementTranslator;