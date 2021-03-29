import { Container } from 'typedi';
import { mock, instance, anything, when, verify } from 'ts-mockito';
import { Translator } from './Translator';
import { JwtDecoder } from '../../../../shared/services/jwt-decoder/JwtDecoder';
import { IMessageBus } from '../message-bus/IMessageBus';
import { SimpleMessageBus } from '../message-bus/SimpleMessageBus';
import { LocaleSubscriber } from './LocaleSubscriber';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { TranslatorToken } from '../../../../shared/dependency-injection/InjectionTokens';
import { ITranslationProvider } from './ITranslationProvider';
import { TranslationProvider } from './TranslationProvider';
import { ITranslator } from './ITranslator';

Container.set({ id: TranslatorToken, type: Translator });
Container.set({ id: ITranslationProvider, type: TranslationProvider });

describe('register()', () => {
  let localeSubscriber: LocaleSubscriber;
  let translator: Translator;
  let messageBus: IMessageBus;
  let jwtDecoderMock: JwtDecoder;
  const newJwt = 'someJwt';

  beforeEach(() => {
    jwtDecoderMock = mock(JwtDecoder);
    when(jwtDecoderMock.decode(newJwt)).thenReturn({ payload: { locale: 'no_NO' } });
    translator = mock(Translator);
    messageBus = new SimpleMessageBus();
    localeSubscriber = new LocaleSubscriber(instance(translator), instance(jwtDecoderMock));
    localeSubscriber.register(messageBus);
  });

  it('Change language on jwt change', () => {
    messageBus.publish({
      type: PUBLIC_EVENTS.UPDATE_JWT,
      data: {
        newJwt
      }
    });
    verify(translator.changeLanguage('no_NO')).once();
  });
});
