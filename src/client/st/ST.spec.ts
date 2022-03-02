import 'reflect-metadata';
import { Container } from 'typedi';
import { of } from 'rxjs';
import { anything, instance, mock, resetCalls, verify, when } from 'ts-mockito';
import { ThreeDSecureFactory } from '@trustpayments/3ds-sdk-js';
import { TestConfigProvider } from '../../testing/mocks/TestConfigProvider';
import { SimpleMessageBus } from '../../application/core/shared/message-bus/SimpleMessageBus';
import { PUBLIC_EVENTS } from '../../application/core/models/constants/EventTypes';
import { TranslatorToken } from '../../shared/dependency-injection/InjectionTokens';
import { Translator } from '../../application/core/shared/translator/Translator';
import { ITranslationProvider } from '../../application/core/shared/translator/ITranslationProvider';
import { TranslationProvider } from '../../application/core/shared/translator/TranslationProvider';
import { ConfigProvider } from '../../shared/services/config-provider/ConfigProvider';
import { EventScope } from '../../application/core/models/constants/EventScope';
import { IFrameQueryingService } from '../../shared/services/message-bus/interfaces/IFrameQueryingService';
import { FrameQueryingService } from '../../shared/services/message-bus/FrameQueryingService';
import { CommonFrames } from '../common-frames/CommonFrames';
import { IMessageBus } from '../../application/core/shared/message-bus/IMessageBus';
import { IClickToPayConfig } from '../../integrations/click-to-pay/models/IClickToPayConfig';
import { FramesHub } from '../../shared/services/message-bus/FramesHub';
import { ClickToPayAdapterName } from '../../integrations/click-to-pay/adapter/ClickToPayAdapterName';
import { ClickToPayAdapterFactory } from '../../integrations/click-to-pay/adapter/ClickToPayAdapterFactory';

import { HPPClickToPayAdapter } from '../../integrations/click-to-pay/adapter/hpp-adapter/HPPClickToPayAdapter';
import SecureTrading, { ST } from './ST';
import { config, jwt } from './STTestConfigs';

const messageBusMock: SimpleMessageBus = new SimpleMessageBus();
const framesHubMock: FramesHub = mock(FramesHub);
const clickToPayAdapterFactoryMock = mock(ClickToPayAdapterFactory);

Container.set({ id: ConfigProvider, type: TestConfigProvider });
Container.set(IMessageBus, messageBusMock);
Container.set({ id: TranslatorToken, type: Translator });
Container.set({ id: ITranslationProvider, type: TranslationProvider });
Container.set({ id: CommonFrames, value: instance(mock(CommonFrames)) });
Container.set({ id: ThreeDSecureFactory, value: instance(mock(ThreeDSecureFactory)) });
Container.set({ id: IFrameQueryingService, type: FrameQueryingService });
Container.set({ id: FramesHub, value: instance(framesHubMock) });
Container.set({ id: ClickToPayAdapterFactory, value: instance(clickToPayAdapterFactoryMock) });

when(framesHubMock.waitForFrame(anything())).thenCall(frame => of(frame));

describe('ST', () => {
  const stInstance: ST = SecureTrading(config);

  beforeAll(() => {
    document.body.innerHTML =
      '<form id="st-form" class="example-form">' +
      '<h1 class="example-form__title">Secure Trading<span>AMOUNT: <strong>10.00 GBP</strong></span></h1>' +
      '<div class="example-form__section example-form__section--horizontal">' +
      '<div class="example-form__group"><label for="example-form-name" class="example-form__label example-form__label--required">NAME</label>' +
      '<input id="example-form-name" class="example-form__input" type="text" placeholder="John Doe" autocomplete="name" />' +
      '</div><div class="example-form__group"><label for="example-form-email" class="example-form__label example-form__label--required">E-MAIL</label>' +
      '<input id="example-form-email" class="example-form__input" type="email" placeholder="test@mail.com" autocomplete="email" /></div>' +
      '<div class="example-form__group"><label for="example-form-phone" class="example-form__label example-form__label--required">PHONE</label>' +
      '<input id="example-form-phone" class="example-form__input" type="tel" placeholder="+00 000 000 000" autocomplete="tel" /></div></div>' +
      '<div class="example-form__spacer"></div><div class="example-form__section"><div id="st-notification-frame" class="example-form__group"></div>' +
      '<div id="st-card-number" class="example-form__group"></div><div id="st-expiration-date" class="example-form__group"></div>' +
      '<div id="st-security-code" class="example-form__group"></div><div id="st-error-container" class="example-form__group"></div>' +
      '<div class="example-form__spacer"></div></div><div class="example-form__section"><div class="example-form__group">' +
      '<button type="submit" class="st-form__button st-button-submit__disabled" disabled>Pay</button></div></div><div class="example-form__section">' +
      '<div id="st-control-frame" class="example-form__group"></div><div id="st-visa-checkout" class="example-form__group"></div>' +
      '<div id="st-apple-pay" class="example-form__group"></div></div><div id="st-animated-card" class="st-animated-card-wrapper">' +
      '</div></form>';
  });

  describe('Components()', () => {
    let submitButton: HTMLButtonElement;
    beforeEach(() => {
      submitButton = document.querySelector('button[type="submit"]');
      stInstance.Components(config.components);
    });

    it('should block submit button', () => {
      expect(submitButton.classList.contains('st-button-submit__disabled')).toEqual(true);
      expect(submitButton.getAttribute('disabled')).toEqual('');
    });
  });

  describe('init()', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'log');
    });

    it('should display test mode message when the library is not in the production mode', () => {
      stInstance.init({
        jwt,
        livestatus: 0,
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        '%cThe %csecure%c//%ctrading %cLibrary is currently working in test mode. Please check your configuration.',
        'margin: 100px 0; font-size: 2em; color: #e71b5a',
        'font-size: 2em; font-weight: bold',
        'font-size: 2em; font-weight: 1000; color: #e71b5a',
        'font-size: 2em; font-weight: bold',
        'font-size: 2em; font-weight: regular; color: #e71b5a');
    });

    it('should not display test mode message when the library is in the production mode', () => {
      stInstance.init({
        jwt,
        livestatus: 1,
      });

      expect(consoleSpy).toHaveBeenCalledTimes(0);
    });
  });

  describe('updateJWT()', () => {

    beforeEach(() => {
      jest.spyOn(messageBusMock, 'publish');
      stInstance.updateJWT('somenewjwtvalue');
    });

    it('should send UPDATE_JWT event to message bus', () => {
      expect(messageBusMock.publish).toHaveBeenCalledWith({
        type: PUBLIC_EVENTS.UPDATE_JWT,
        data: { newJwt: 'somenewjwtvalue' },
      });
    });

    it('should throw an error if newJwt is not specified', () => {
      expect(() => {
        stInstance.updateJWT(null);
      }).toThrow();
    });
  });

  describe('destroy()', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      resetCalls(framesHubMock);
      jest.spyOn(messageBusMock, 'publish');
      stInstance.destroy();
    });

    it(`should send ${PUBLIC_EVENTS.DESTROY} event on MessageBus`, () => {
      expect(messageBusMock.publish).toHaveBeenCalledWith({ type: PUBLIC_EVENTS.DESTROY }, EventScope.ALL_FRAMES);
    });

    it('should reset the frames hub', () => {
      verify(framesHubMock.reset()).once();
    });
  });

  describe('cancelThreeDProcess()', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.spyOn(messageBusMock, 'publish');
      stInstance.cancelThreeDProcess();
    });

    it(`should send ${PUBLIC_EVENTS.THREED_CANCEL} event on MessageBus`, () => {
      expect(messageBusMock.publish).toHaveBeenCalledWith({ type: PUBLIC_EVENTS.THREED_CANCEL }, EventScope.ALL_FRAMES);
    });
  });

  describe('ClickToPay()', () => {
    let clickToPayConfig: IClickToPayConfig;

    beforeEach(() => {
      stInstance['initControlFrame$'] = jest.fn().mockReturnValueOnce(of(null));// TODO mock dependencies properly
      when(clickToPayAdapterFactoryMock.create(ClickToPayAdapterName.hpp))
        .thenReturn(new HPPClickToPayAdapter(null, null, null, null, null, null));
    });

    it('should create ClickToPayAdapter depending on adapter type and return Promise with reference to it', done => {
      clickToPayConfig = { adapter: ClickToPayAdapterName.hpp };
      stInstance.ClickToPay(clickToPayConfig).then(adapter => {
        expect(adapter).toBeInstanceOf(HPPClickToPayAdapter);
        done();
      });
    });
  });
});
