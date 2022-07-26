import Joi from 'joi';

export const GooglePayButtonOptionsSchema: Joi.ObjectSchema = Joi.object().keys({
  buttonColor: Joi.string().valid('default', 'black', 'white'),
  buttonLocale: Joi.string().valid(
    'en',
    'ar',
    'bg',
    'ca',
    'cs',
    'da',
    'de',
    'el',
    'es',
    'et',
    'fi',
    'fr',
    'hr',
    'id',
    'it',
    'ja',
    'ko',
    'ms',
    'nl',
    'no',
    'pl',
    'pt',
    'ru',
    'sk',
    'sl',
    'sr',
    'sv',
    'th',
    'tr',
    'uk',
    'zh'
  ),
  buttonRootNode: Joi.string().required(),
  buttonSizeMode: Joi.string().valid('static', 'fill'),
  buttonType: Joi.string().valid('buy', 'donate', 'plain', 'long', 'short'),
});
