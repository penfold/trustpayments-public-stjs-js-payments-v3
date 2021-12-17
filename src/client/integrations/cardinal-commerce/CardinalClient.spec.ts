import { anyString, anything, instance, mock, spy, verify, when } from 'ts-mockito';
import { Observable, of, Subscription } from 'rxjs';
import { delay } from 'rxjs/operators';
import { CardinalMock } from '../../../testing/mocks/CardinalMock';
import { environment } from '../../../environments/environment';
import { PaymentEvents } from '../../../application/core/models/constants/PaymentEvents';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { IConfig } from '../../../shared/model/config/IConfig';
import { InterFrameCommunicator } from '../../../shared/services/message-bus/InterFrameCommunicator';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { PaymentBrand } from '../../../application/core/models/constants/PaymentBrand';
import { IVerificationData } from '../../../application/core/services/three-d-verification/implementations/cardinal-commerce/data/IVerificationData';
import { IVerificationResult } from '../../../application/core/services/three-d-verification/implementations/cardinal-commerce/data/IVerificationResult';
import { ActionCode } from '../../../application/core/services/three-d-verification/implementations/cardinal-commerce/data/ActionCode';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { SimpleMessageBus } from '../../../application/core/shared/message-bus/SimpleMessageBus';
import { GoogleAnalytics } from '../../../application/core/integrations/google-analytics/GoogleAnalytics';
import { SentryService } from '../../../shared/services/sentry/SentryService';
import { IInitializationData } from './data/IInitializationData';
import { ICardinal } from './ICardinal';
import { CardinalClient } from './CardinalClient';
import { CardinalProvider } from './CardinalProvider';
import { ITriggerData } from './data/ITriggerData';

describe('CardinalClient', () => {
  let configProviderMock: ConfigProvider;
  let cardinalProviderMock: CardinalProvider;
  let interFrameCommunicatorMock: InterFrameCommunicator;
  let interFrameCommunicator: InterFrameCommunicator;
  let cardinalClient: CardinalClient;
  let cardinalMock: ICardinal;
  let communicationCallbacks: Map<string, (event: IMessageBusEvent) => unknown>;
  let messageBusMock: IMessageBus;
  let googleAnalytics: GoogleAnalytics;
  let sentryServiceMock: SentryService;

  const config: IConfig = { livestatus: 0 } as IConfig;
  const sendMessage = (event: IMessageBusEvent): Observable<unknown> => {
    return (interFrameCommunicator.send(event, '') as unknown) as Observable<unknown>;
  };

  beforeEach(() => {
    communicationCallbacks = new Map();
    configProviderMock = mock<ConfigProvider>();
    cardinalProviderMock = mock(CardinalProvider);
    interFrameCommunicatorMock = mock(InterFrameCommunicator);
    interFrameCommunicator = instance(interFrameCommunicatorMock);
    cardinalMock = new CardinalMock(true);
    messageBusMock = new SimpleMessageBus();
    googleAnalytics = mock(GoogleAnalytics);
    sentryServiceMock = mock(SentryService);

    when(configProviderMock.getConfig$()).thenReturn(of(config));
    when(cardinalProviderMock.getCardinal$(false)).thenReturn(of(cardinalMock));
    when(interFrameCommunicatorMock.whenReceive(anyString())).thenCall((eventType: string) => {
      return {
        thenRespond: (callback: (event: IMessageBusEvent) => Observable<unknown>) => {
          communicationCallbacks.set(eventType, callback);
        },
      };
    });

    when(interFrameCommunicatorMock.send(anything(), anything())).thenCall((event: IMessageBusEvent) => {
      return communicationCallbacks.get(event.type)(event);
    });

    when(sentryServiceMock.captureAndReportResourceLoadingTimeout(anything())).thenReturn(source => source);

    cardinalClient = new CardinalClient(
      interFrameCommunicator,
      messageBusMock,
      instance(cardinalProviderMock),
      instance(configProviderMock),
      instance(googleAnalytics),
      instance(sentryServiceMock)
    );

    cardinalClient.init();
  });

  describe('setup', () => {
    const initializationData: IInitializationData = { jwt: 'foobar' };

    it('configures cardinal library', () => {
      jest.spyOn(cardinalMock, 'configure');
      sendMessage({ type: PUBLIC_EVENTS.CARDINAL_SETUP, data: initializationData }).subscribe();
      expect(cardinalMock.configure).toHaveBeenCalledWith(environment.CARDINAL_COMMERCE.CONFIG);
    });

    it('calls cardinal.setup and unbinds listener when setup completes', done => {
      jest.spyOn(cardinalMock, 'setup');
      jest.spyOn(cardinalMock, 'on');
      jest.spyOn(cardinalMock, 'off');

      sendMessage({ type: PUBLIC_EVENTS.CARDINAL_SETUP, data: initializationData })
        .pipe(delay(0))
        .subscribe(() => {
          expect(cardinalMock.off).toHaveBeenCalledWith(PaymentEvents.SETUP_COMPLETE);
          done();
        });

      expect(cardinalMock.setup).toHaveBeenCalledWith('init', { jwt: 'foobar' });
      expect(cardinalMock.on).toHaveBeenCalledWith(PaymentEvents.SETUP_COMPLETE, expect.anything());

      cardinalMock.trigger(PaymentEvents.SETUP_COMPLETE);
    });

    it('should check if only one setup function call has been made', done => {
      jest.spyOn(cardinalMock, 'setup');

      sendMessage({ type: PUBLIC_EVENTS.CARDINAL_SETUP, data: initializationData })
        .pipe(delay(0))
        .subscribe(() => done());

      sendMessage({ type: PUBLIC_EVENTS.CARDINAL_SETUP, data: initializationData })
        .pipe(delay(0))
        .subscribe(() => done());

      expect(cardinalMock.setup).toHaveBeenCalledWith('init', { jwt: 'foobar' });
      expect(cardinalMock.setup).toHaveBeenCalledTimes(1);

      cardinalMock.trigger(PaymentEvents.SETUP_COMPLETE);
    });
  });

  describe('start', () => {
    it('calls cardinal.start with given jwt', done => {
      const initializationData: IInitializationData = { jwt: 'foobar' };

      jest.spyOn(cardinalMock, 'start');
      jest.spyOn(cardinalMock, 'on');

      sendMessage({ type: PUBLIC_EVENTS.CARDINAL_START, data: initializationData }).subscribe(done);

      expect(cardinalMock.start).toHaveBeenCalledWith(PaymentBrand, {}, 'foobar');

      cardinalMock.trigger(PaymentEvents.VALIDATED, { ErrorNumber: 4000 });
    });
  });

  describe('trigger', () => {
    it('calls cardinal.trigger with given data', done => {
      const triggerData: ITriggerData<string> = {
        eventName: PaymentEvents.BIN_PROCESS,
        data: '4111111111111111',
      };

      jest.spyOn(cardinalMock, 'trigger');

      sendMessage({ type: PUBLIC_EVENTS.CARDINAL_TRIGGER, data: triggerData }).subscribe(done);

      expect(cardinalMock.trigger).toHaveBeenCalledWith(triggerData.eventName, triggerData.data);
    });
  });

  describe('continue', () => {
    const data: IVerificationData = {
      transactionId: 'abc-123',
      payload: 'fooobar',
      jwt: 'xyz',
      acsUrl: 'https://example.com/',
    };

    it('calls cardinal continue with given data', () => {
      jest.spyOn(cardinalMock, 'continue');

      sendMessage({ type: PUBLIC_EVENTS.CARDINAL_CONTINUE, data }).subscribe();

      expect(cardinalMock.continue).toHaveBeenCalledWith(
        PaymentBrand,
        {
          AcsUrl: 'https://example.com/',
          Payload: 'fooobar',
        },
        {
          Cart: [],
          OrderDetails: {
            TransactionId: 'abc-123',
          },
        },
        'xyz'
      );
    });

    it('returns validation result', done => {
      const RESPONSE_JWT = 'asdf';

      jest.spyOn(cardinalMock, 'off');

      sendMessage({ type: PUBLIC_EVENTS.CARDINAL_CONTINUE, data })
        .pipe(delay(0))
        .subscribe((result: IVerificationResult) => {
          expect(result).toEqual({
            validated: true,
            actionCode: ActionCode.SUCCESS,
            errorNumber: 0,
            errorDescription: 'no error',
            jwt: RESPONSE_JWT,
          });
          expect(cardinalMock.off).toHaveBeenCalledWith(PaymentEvents.VALIDATED);
          done();
        });

      cardinalMock.trigger(
        PaymentEvents.VALIDATED,
        {
          Validated: true,
          ActionCode: ActionCode.SUCCESS,
          ErrorNumber: 0,
          ErrorDescription: 'no error',
        },
        RESPONSE_JWT
      );
    });

    it('ignores cardinal validation error 4000', done => {
      sendMessage({ type: PUBLIC_EVENTS.CARDINAL_CONTINUE, data }).subscribe((result: IVerificationResult) => {
        expect(result.errorNumber).toBe(0);
        done();
      });

      cardinalMock.trigger(
        PaymentEvents.VALIDATED,
        {
          Validated: false,
          ActionCode: ActionCode.ERROR,
          ErrorNumber: 4000,
          ErrorDescription: 'error description',
        },
        'foobar1'
      );

      cardinalMock.trigger(
        PaymentEvents.VALIDATED,
        {
          Validated: true,
          ActionCode: ActionCode.SUCCESS,
          ErrorNumber: 0,
          ErrorDescription: 'no error',
        },
        'foobar2'
      );
    });
  });

  describe('threeD cancel', () => {
    const data: IVerificationData = {
      transactionId: 'abc-123',
      payload: 'fooobar',
      jwt: 'xyz',
      acsUrl: 'https://example.com/',
    };

    it('creates subscription to threeDPopupCancel which, when invoked, fails payment validation', done => {
      sendMessage({ type: PUBLIC_EVENTS.CARDINAL_CONTINUE, data })
        .pipe(delay(0))
        .subscribe((result: IVerificationResult) => {
          expect(result).toEqual({
            validated: false,
            actionCode: ActionCode.FAILURE,
            errorNumber: 4001,
            errorDescription: '3DS process has been cancelled',
          });
          done();
        });

      messageBusMock.publish({ type: PUBLIC_EVENTS.THREED_CANCEL });
    });

    it('should remove the cardinal popup container from DOM', () => {
      const mockedContainer = document.createElement('div');
      mockedContainer.setAttribute('id', 'Cardinal-ElementContainer');
      document.body.appendChild(mockedContainer);

      messageBusMock.publish({ type: PUBLIC_EVENTS.THREED_CANCEL });

      const appendedContainer = document.getElementById('Cardinal-ElementContainer');
      expect(appendedContainer).toBeNull();
    });

    it('should not remove the cardinal popup container from DOM if it doesn\'t exist', () => {
      jest.spyOn(document, 'getElementById').mockReturnValue(null);
      jest.spyOn(HTMLElement.prototype, 'removeChild');

      messageBusMock.publish({ type: PUBLIC_EVENTS.THREED_CANCEL });

      expect(HTMLElement.prototype.removeChild).not.toHaveBeenCalled();
    });

    it('unsubscribes from the cancel event when validation completes', done => {
      // @ts-ignore
      const popupCancelSpy: Subject<void> = spy(cardinalClient.threeDPopupCancel$);
      const popupCancelSubscriptionMock: Subscription = mock<Subscription>();
      when(popupCancelSpy.subscribe(anything())).thenReturn(instance(popupCancelSubscriptionMock));

      sendMessage({ type: PUBLIC_EVENTS.CARDINAL_CONTINUE, data })
        .pipe(delay(1000))
        .subscribe((result: IVerificationResult) => {
          expect(result.validated).toEqual(true);
          verify(popupCancelSubscriptionMock.unsubscribe()).once();
          done();
        });

      cardinalMock.trigger(
        PaymentEvents.VALIDATED,
        {
          Validated: true,
          ActionCode: ActionCode.SUCCESS,
          ErrorNumber: 0,
          ErrorDescription: 'no error',
        },
        'somejwt'
      );
    });
  });
});
