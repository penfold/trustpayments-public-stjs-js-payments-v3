import { InterFrameCommunicator } from '../../../../../../shared/services/message-bus/InterFrameCommunicator';
import { ThreeDSecureMethodService } from './ThreeDSecureMethodService';
import { anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { MERCHANT_PARENT_FRAME } from '../../../../models/constants/Selectors';
import { IMessageBusEvent } from '../../../../models/IMessageBusEvent';
import { IMethodUrlData } from '../../../../../../client/integrations/three-d-secure/IMethodUrlData';
import { PUBLIC_EVENTS } from '../../../../models/constants/EventTypes';
import { MethodURLResultInterface, ResultActionCode } from '3ds-sdk-js';

describe('ThreeDSecureMethodService', () => {
  let interFrameCommunicatorMock: InterFrameCommunicator;
  let sut: ThreeDSecureMethodService;

  beforeEach(() => {
    interFrameCommunicatorMock = mock(InterFrameCommunicator);
    sut = new ThreeDSecureMethodService(instance(interFrameCommunicatorMock));
  });

  describe('perform3DSMethod$()', () => {
    it('returns undefined when methodUrl is empty', done => {
      sut.perform3DSMethod$('', 'https://notificationurl', '12345').subscribe(result => {
        expect(result).toBeUndefined();
        verify(interFrameCommunicatorMock.query(anything(), MERCHANT_PARENT_FRAME)).never();
        done();
      });
    });

    it('send the THREE_D_SECURE_METHOD_URL query and returns the result', done => {
      const methodUrl = 'https://methodurl';
      const notificationUrl = 'https://notificationurl';
      const transactionId = '12345';

      const queryEvent: IMessageBusEvent<IMethodUrlData> = {
        type: PUBLIC_EVENTS.THREE_D_SECURE_METHOD_URL,
        data: {
          methodUrl,
          notificationUrl,
          transactionId,
        },
      };

      const methodUrlResult: MethodURLResultInterface = {
        status: ResultActionCode.SUCCESS,
        description: '',
        transactionId: '12345',
      };

      when(interFrameCommunicatorMock.query(deepEqual(queryEvent), MERCHANT_PARENT_FRAME)).thenResolve(methodUrlResult);

      sut.perform3DSMethod$(methodUrl, notificationUrl, transactionId).subscribe(result => {
        verify(interFrameCommunicatorMock.query(deepEqual(queryEvent), MERCHANT_PARENT_FRAME)).once();
        expect(result).toBe(methodUrlResult);
        done();
      });
    });
  });
});
