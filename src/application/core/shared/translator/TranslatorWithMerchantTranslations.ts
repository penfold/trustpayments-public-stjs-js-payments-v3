import { Service } from 'typedi';
import { BrowserLocalStorage } from '../../../../shared/services/storage/BrowserLocalStorage';
import { Locale } from './Locale';
import { Translator } from './Translator';
import { ITranslator } from './ITranslator';
import { IMessageBus } from '../message-bus/IMessageBus';
import { ofType } from '../../../../shared/services/message-bus/operators/ofType';
import { JwtDecoder } from '../../../../shared/services/jwt-decoder/JwtDecoder';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { filter, map, takeUntil } from 'rxjs/operators';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { merge, Observable } from 'rxjs';
import { IUpdateJwt } from '../../models/IUpdateJwt';

@Service()
export class TranslatorWithMerchantTranslations implements ITranslator {
  constructor(
    private jwtDecoder: JwtDecoder,
    private translator: Translator,
    private storage: BrowserLocalStorage,
    private messageBus: IMessageBus,
    private configProvider: ConfigProvider,
  ) {}

  init() {
    this.translator.init();

    const destroy$ = this.messageBus.pipe(ofType(PUBLIC_EVENTS.DESTROY));
    const jwt$: Observable<string> = merge(
      this.configProvider.getConfig$().pipe(map(config => config.jwt)),
      this.messageBus.pipe(
        ofType(PUBLIC_EVENTS.UPDATE_JWT),
        map((event: IMessageBusEvent<IUpdateJwt>) => event.data.newJwt),
      ),
    );
    jwt$.pipe(
      map((jwt: string) => this.jwtDecoder.decode(jwt).payload.locale),
      filter(Boolean),
      takeUntil(destroy$),
    ).subscribe((locale: Locale) => {
      this.translator.changeLanguage(locale);
      this.messageBus.publish({type: PUBLIC_EVENTS.LOCALE_CHANGED, data: locale}, true);
    });
  }

  translate(text: string): string {
    let json: any;

    try {
      const translations: string = this.storage.getItem('merchantTranslations');
      json = translations ? JSON.parse(translations) : {};
    } catch (e) {
      json = {};
    }

    if (Object.keys(json).length > 0 && Object.keys(json).includes(text)) {
      return json[text];
    }

    return this.translator.translate(text) ?? text;
  }

  changeLanguage(language: Locale): void {
    this.translator.changeLanguage(language);
  }
}
