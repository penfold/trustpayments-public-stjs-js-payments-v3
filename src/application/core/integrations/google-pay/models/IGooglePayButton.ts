type IGooglePayButtonColors = 'default' | 'black' | 'white';

type IGooglePayButtonLocales =
  | 'en'
  | 'ar'
  | 'bg'
  | 'ca'
  | 'cs'
  | 'da'
  | 'de'
  | 'el'
  | 'es'
  | 'et'
  | 'fi'
  | 'fr'
  | 'hr'
  | 'id'
  | 'it'
  | 'ja'
  | 'ko'
  | 'ms'
  | 'nl'
  | 'no'
  | 'pl'
  | 'pt'
  | 'ru'
  | 'sk'
  | 'sl'
  | 'sr'
  | 'sv'
  | 'th'
  | 'tr'
  | 'uk'
  | 'zh';

type IGooglePayButtonType = 'buy' | 'donate' | 'plain' | 'long' | 'short';

type IGooglePayButtonSizeModes = 'static' | 'fill';

export interface IGooglePayButtonOptions {
  buttonColor?: IGooglePayButtonColors;
  buttonLocale?: IGooglePayButtonLocales;
  buttonRootNode?: any;
  buttonSizeMode?: IGooglePayButtonSizeModes;
  buttonType?: IGooglePayButtonType;
  onClick: () => void;
}
