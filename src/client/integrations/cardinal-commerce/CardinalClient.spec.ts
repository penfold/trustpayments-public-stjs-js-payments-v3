import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { CardinalProvider } from './CardinalProvider';
import { anyString, anything, instance, mock, when } from 'ts-mockito';
import { InterFrameCommunicator } from '../../../shared/services/message-bus/InterFrameCommunicator';
import { CardinalClient } from './CardinalClient';
import { ICardinal } from './ICardinal';
import { IConfig } from '../../../shared/model/config/IConfig';
import { Observable, of } from 'rxjs';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { IInitializationData } from './data/IInitializationData';
import { CardinalMock } from '../../../testing/mocks/CardinalMock';
import { environment } from '../../../environments/environment';
import { PaymentEvents } from '../../../application/core/models/constants/PaymentEvents';
import { delay } from 'rxjs/operators';
import { PaymentBrand } from '../../../application/core/models/constants/PaymentBrand';
import { ITriggerData } from './data/ITriggerData';
import { IVerificationData } from '../../../application/core/services/three-d-verification/data/IVerificationData';
import { IVerificationResult } from '../../../application/core/services/three-d-verification/data/IVerificationResult';
import { ActionCode } from '../../../application/core/services/three-d-verification/data/ActionCode';

describe('CardinalClient', () => {
  let configProviderMock: ConfigProvider;
  let cardinalProviderMock: CardinalProvider;
  let interFrameCommunicatorMock: InterFrameCommunicator;
  let interFrameCommunicator: InterFrameCommunicator;
  let cardinalClient: CardinalClient;
  let cardinalMock: ICardinal;
  let communicationCallbacks: Map<string, (event: IMessageBusEvent) => any>;

  const config: IConfig = { livestatus: 0 } as IConfig;
  const sendMessage = (event: IMessageBusEvent): Observable<any> => {
    return (interFrameCommunicator.send(event, '') as unknown) as Observable<any>;
  };

  beforeEach(() => {
    communicationCallbacks = new Map();
    configProviderMock = mock<ConfigProvider>();
    cardinalProviderMock = mock(CardinalProvider);
    interFrameCommunicatorMock = mock(InterFrameCommunicator);
    interFrameCommunicator = instance(interFrameCommunicatorMock);
    cardinalMock = new CardinalMock(true);

    when(configProviderMock.getConfig$()).thenReturn(of(config));
    when(cardinalProviderMock.getCardinal$(false)).thenReturn(of(cardinalMock));
    when(interFrameCommunicatorMock.whenReceive(anyString())).thenCall((eventType: string) => {
      return {
        thenRespond: (callback: (event: IMessageBusEvent) => Observable<any>) => {
          communicationCallbacks.set(eventType, callback);
        }
      };
    });

    when(interFrameCommunicatorMock.send(anything(), anything())).thenCall((event: IMessageBusEvent) => {
      return communicationCallbacks.get(event.type)(event);
    });

    cardinalClient = new CardinalClient(
      interFrameCommunicator,
      instance(cardinalProviderMock),
      instance(configProviderMock)
    );

    cardinalClient.init();
  });

  describe('setup', () => {
    const initializationData: IInitializationData = { jwt: 'foobar' };

    it('configures cardinal library', () => {
      spyOn(cardinalMock, 'configure');
      sendMessage({ type: PUBLIC_EVENTS.CARDINAL_SETUP, data: initializationData }).subscribe();
      expect(cardinalMock.configure).toHaveBeenCalledWith(environment.CARDINAL_COMMERCE.CONFIG);
    });

    it('calls cardinal.setup and unbinds listener when setup completes', done => {
      spyOn(cardinalMock, 'setup').and.callThrough();
      spyOn(cardinalMock, 'on').and.callThrough();
      spyOn(cardinalMock, 'off');

      sendMessage({ type: PUBLIC_EVENTS.CARDINAL_SETUP, data: initializationData })
        .pipe(delay(0))
        .subscribe(() => {
          expect(cardinalMock.off).toHaveBeenCalledWith(PaymentEvents.SETUP_COMPLETE);
          done();
        });

      expect(cardinalMock.setup).toHaveBeenCalledWith('init', { jwt: 'foobar' });
      expect(cardinalMock.on).toHaveBeenCalledWith(PaymentEvents.SETUP_COMPLETE, jasmine.anything());

      cardinalMock.trigger(PaymentEvents.SETUP_COMPLETE);
    });
  });

  describe('start', () => {
    it('calls cardinal.start with given jwt', done => {
      const initializationData: IInitializationData = { jwt: 'foobar' };

      spyOn(cardinalMock, 'start').and.callThrough();
      spyOn(cardinalMock, 'on').and.callThrough();

      sendMessage({ type: PUBLIC_EVENTS.CARDINAL_START, data: initializationData }).subscribe(done);

      expect(cardinalMock.start).toHaveBeenCalledWith(PaymentBrand, {}, 'foobar');

      cardinalMock.trigger(PaymentEvents.VALIDATED, { ErrorNumber: 4000 });
    });
  });

  describe('trigger', () => {
    it('calls cardinal.trigger with given data', done => {
      const triggerData: ITriggerData<string> = {
        eventName: PaymentEvents.BIN_PROCESS,
        data: '4111111111111111'
      };

      spyOn(cardinalMock, 'trigger');

      sendMessage({ type: PUBLIC_EVENTS.CARDINAL_TRIGGER, data: triggerData }).subscribe(done);

      expect(cardinalMock.trigger).toHaveBeenCalledWith(triggerData.eventName, triggerData.data);
    });
  });

  describe('continue', () => {
    const data: IVerificationData = {
      transactionId: 'abc-123',
      payload: 'fooobar',
      jwt: 'xyz',
      acsUrl: 'https://example.com/'
    };

    it('calls cardinal continue with given data', () => {
      spyOn(cardinalMock, 'continue').and.callThrough();

      sendMessage({ type: PUBLIC_EVENTS.CARDINAL_CONTINUE, data }).subscribe();

      expect(cardinalMock.continue).toHaveBeenCalledWith(
        PaymentBrand,
        {
          AcsUrl: 'https://example.com/',
          Payload: 'fooobar'
        },
        {
          Cart: [],
          OrderDetails: {
            TransactionId: 'abc-123'
          }
        },
        'xyz'
      );
    });

    it('returns validation result', done => {
      const RESPONSE_JWT = 'asdf';

      spyOn(cardinalMock, 'off');

      sendMessage({ type: PUBLIC_EVENTS.CARDINAL_CONTINUE, data })
        .pipe(delay(0))
        .subscribe((result: IVerificationResult) => {
          expect(result).toEqual({
            validated: true,
            actionCode: ActionCode.SUCCESS,
            errorNumber: 0,
            errorDescription: 'no error',
            jwt: RESPONSE_JWT
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
          ErrorDescription: 'no error'
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
          ErrorDescription: 'error description'
        },
        'foobar1'
      );

      cardinalMock.trigger(
        PaymentEvents.VALIDATED,
        {
          Validated: true,
          ActionCode: ActionCode.SUCCESS,
          ErrorNumber: 0,
          ErrorDescription: 'no error'
        },
        'foobar2'
      );
    });
  });
});
