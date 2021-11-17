import { Service } from 'typedi';
import { filter, map, takeUntil } from 'rxjs/operators';
import { merge, Observable } from 'rxjs';
import { IMessageBus } from '../message-bus/IMessageBus';
import { ofType } from '../../../../shared/services/message-bus/operators/ofType';
import { JwtDecoder } from '../../../../shared/services/jwt-decoder/JwtDecoder';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { BrowserLocalStorage } from '../../../../shared/services/storage/BrowserLocalStorage';
import { IUpdateJwt } from '../../models/IUpdateJwt';
import { IStJwtPayload } from '../../models/IStJwtPayload';
import { EventScope } from '../../models/constants/EventScope';
import { ITranslator } from './ITranslator';
import { Translator } from './Translator';
import { Locale } from './Locale';

@Service()
export class TranslatorWithMerchantTranslations implements ITranslator {
  constructor(
    private jwtDecoder: JwtDecoder,
    private translator: Translator,
    private storage: BrowserLocalStorage,
    private messageBus: IMessageBus,
    private configProvider: ConfigProvider
  ) {}

  init(): void {
    this.translator.init();

    const destroy$ = this.messageBus.pipe(ofType(PUBLIC_EVENTS.DESTROY));
    const jwt$: Observable<string> = merge(
      this.configProvider.getConfig$().pipe(map(config => config.jwt)),
      this.messageBus.pipe(
        ofType(PUBLIC_EVENTS.UPDATE_JWT),
        map((event: IMessageBusEvent<IUpdateJwt>) => event.data.newJwt)
      )
    );
    jwt$
      .pipe(
        map((jwt: string) => this.jwtDecoder.decode<IStJwtPayload>(jwt).payload.locale),
        filter(Boolean),
        takeUntil(destroy$)
      )
      .subscribe((locale: Locale) => {
        this.translator.changeLanguage(locale);
        this.messageBus.publish({ type: PUBLIC_EVENTS.LOCALE_CHANGED, data: locale },  EventScope.ALL_FRAMES);
      });
  }

  translate(text: string): string {
    let json: Record<string, string>;

    try {
      const translations: string = this.storage.getItem('merchantTranslations') as string;
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
