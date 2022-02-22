import { anyFunction, anything, instance, mock, objectContaining, verify, when } from 'ts-mockito';
import { of, throwError } from 'rxjs';
import { ClickToPayPaymentMethodName } from '../../models/ClickToPayPaymentMethodName';
import { IMessageBus } from '../../../../application/core/shared/message-bus/IMessageBus';
import { IFrameQueryingService } from '../../../../shared/services/message-bus/interfaces/IFrameQueryingService';
import { DigitalTerminal } from '../../digital-terminal/DigitalTerminal';
import { PUBLIC_EVENTS } from '../../../../application/core/models/constants/EventTypes';
import { EventScope } from '../../../../application/core/models/constants/EventScope';
import { IIdentificationData } from '../../digital-terminal/interfaces/IIdentificationData';
import { IIdentificationResult } from '../../digital-terminal/interfaces/IIdentificationResult';
import { IHPPClickToPayAdapterInitParams } from './IHPPClickToPayAdapterInitParams';
import { HPPClickToPayAdapter } from './HPPClickToPayAdapter';

describe('HPPClickToPayAdapter', () => {
  const initParams: IHPPClickToPayAdapterInitParams = {
    srciDpaId: '1',
    cardListContainerId: 'cardList',
    formId: 'formId',
    dpaTransactionOptions: null,
  };
  let messageBus: IMessageBus;
  let frameQueryingServiceMock: IFrameQueryingService;
  let digitalTerminalMock: DigitalTerminal;
  let sut: HPPClickToPayAdapter;

  beforeEach(() => {
    messageBus = mock<IMessageBus>();
    frameQueryingServiceMock = mock<IFrameQueryingService>();
    digitalTerminalMock = mock(DigitalTerminal);
    when(digitalTerminalMock.init(anything())).thenReturn(of(undefined));
    when(frameQueryingServiceMock.whenReceive(PUBLIC_EVENTS.CLICK_TO_PAY_INIT, anyFunction())).thenCall((eventType, callback) => {
      callback({ type: eventType, data: initParams }).subscribe();
    });
    sut = new HPPClickToPayAdapter(instance(digitalTerminalMock), instance(messageBus), instance(frameQueryingServiceMock));
  });

  describe('init()', () => {
    it(`should initialize ${ClickToPayPaymentMethodName} payment method using message bus`, done => {
      sut.init(initParams).then(() => {
        const paymentMethodInitEvent = {
          type: PUBLIC_EVENTS.INIT_PAYMENT_METHOD,
          data: {
            name: ClickToPayPaymentMethodName,
            config: initParams,
          },
        };

        verify(messageBus.publish(objectContaining(paymentMethodInitEvent), EventScope.THIS_FRAME)).once();
        done();
      });
    });
  });

  it(`should subscribe to message bus event ${PUBLIC_EVENTS.CLICK_TO_PAY_INIT}, run initAdapter method and return Promise with reference to adapter `, done => {
    sut.init(initParams).then((adapterReference) => {
      verify(frameQueryingServiceMock.whenReceive(PUBLIC_EVENTS.CLICK_TO_PAY_INIT, anyFunction())).once();
      verify(digitalTerminalMock.init(initParams)).once();
      expect(adapterReference).toEqual(sut);
      done();
    });
  });

  describe('showCardList()', () => {
    test.todo('add tests');
  });

  describe('isRecognized()', () => {
    it('should return response from DigitalTerminal.isRecognized() method as Promise', (done) => {
      when(digitalTerminalMock.isRecognized()).thenReturn(of(true));
      const response = sut.isRecognized();
      expect(response).toBeInstanceOf(Promise);
      response.then((result) => {
        verify(digitalTerminalMock.isRecognized()).once();
        expect(result).toEqual(true);
        done();
      });
    });

  });
  it('should propagate error from DigitalTerminal.isRecognized() if any occurs', (done) => {
    const errorResponse = new Error('digital terminal error');

    when(digitalTerminalMock.isRecognized()).thenReturn(throwError(() => errorResponse));
    const response = sut.isRecognized();
    expect(response).toBeInstanceOf(Promise);
    response.catch(error => {
      verify(digitalTerminalMock.isRecognized()).once();
      // eslint-disable-next-line jest/no-conditional-expect
      expect(error).toEqual(errorResponse);
    }).finally(() => done());
  });

  describe('identifyUser()', () => {
    it('should return response from DigitalTerminal.identifyUser() method as Promise', (done) => {
      const identificationResult: IIdentificationResult = { isSuccessful: true };
      const testData: IIdentificationData = {
        email: 'email@example.com',
      };
      when(digitalTerminalMock.identifyUser(anything())).thenReturn(of(identificationResult));
      const response = sut.identifyUser(testData);
      expect(response).toBeInstanceOf(Promise);
      response.then(result => {
        verify(digitalTerminalMock.identifyUser(testData)).once();
        expect(result).toEqual(true);
        done();
      });
    });
  });

  it('should propagate error from DigitalTerminal.identifyUser() if any occurs', (done) => {
    const errorResponse = new Error('digital terminal error');

    when(digitalTerminalMock.identifyUser(anything())).thenReturn(throwError(() => errorResponse));
    const testData: IIdentificationData = {
      email: 'email@example.com',
    };
    const response = sut.identifyUser(testData);
    expect(response).toBeInstanceOf(Promise);
    response.catch(error => {
      verify(digitalTerminalMock.identifyUser(testData)).once();
      // eslint-disable-next-line jest/no-conditional-expect
      expect(error).toEqual(errorResponse);
    }).finally(() => done());
  });
});
