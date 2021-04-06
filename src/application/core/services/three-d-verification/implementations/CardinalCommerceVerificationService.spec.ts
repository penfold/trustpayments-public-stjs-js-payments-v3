import { InterFrameCommunicator } from '../../../../../shared/services/message-bus/InterFrameCommunicator';
import { CardinalCommerceVerificationService } from './CardinalCommerceVerificationService';
import { anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { MERCHANT_PARENT_FRAME } from '../../../models/constants/Selectors';
import { PUBLIC_EVENTS } from '../../../models/constants/EventTypes';
import { PaymentEvents } from '../../../models/constants/PaymentEvents';
import { IVerificationData } from '../data/IVerificationData';

describe('CardinalCommerceVerificationService', () => {
  let interFrameCommunicatorMock: InterFrameCommunicator;
  let verificationService: CardinalCommerceVerificationService;

  beforeEach(() => {
    interFrameCommunicatorMock = mock(InterFrameCommunicator);
    verificationService = new CardinalCommerceVerificationService(instance(interFrameCommunicatorMock));

    when(interFrameCommunicatorMock.query(anything(), MERCHANT_PARENT_FRAME)).thenResolve('hello');
  });

  describe('init', () => {
    it('calls init query', done => {
      verificationService.init('foobar').subscribe(() => {
        const event = {
          type: PUBLIC_EVENTS.CARDINAL_SETUP,
          data: { jwt: 'foobar' },
        };
        verify(interFrameCommunicatorMock.query(deepEqual(event), MERCHANT_PARENT_FRAME)).once();
        done();
      });
    });
  });

  describe('binLookup', () => {
    it('calls bin process query', done => {
      const pan = '4111111111111111';
      verificationService.binLookup(pan).subscribe(() => {
        const event = {
          type: PUBLIC_EVENTS.CARDINAL_TRIGGER,
          data: {
            eventName: PaymentEvents.BIN_PROCESS,
            data: pan,
          },
        };
        verify(interFrameCommunicatorMock.query(deepEqual(event), MERCHANT_PARENT_FRAME)).once();
        done();
      });
    });
  });

  describe('start', () => {
    it('calls start query', done => {
      verificationService.start('foobar').subscribe(() => {
        const event = {
          type: PUBLIC_EVENTS.CARDINAL_START,
          data: { jwt: 'foobar' },
        };
        verify(interFrameCommunicatorMock.query(deepEqual(event), MERCHANT_PARENT_FRAME)).once();
        done();
      });
    });
  });

  describe('verify', () => {
    it('calls continue query', done => {
      const data: IVerificationData = {
        acsUrl: 'a',
        jwt: 'b',
        payload: 'c',
        transactionId: 'd',
      };

      verificationService.verify(data).subscribe(() => {
        const event = {
          type: PUBLIC_EVENTS.CARDINAL_CONTINUE,
          data,
        };
        verify(interFrameCommunicatorMock.query(deepEqual(event), MERCHANT_PARENT_FRAME)).once();
        done();
      });
    });
  });
});
