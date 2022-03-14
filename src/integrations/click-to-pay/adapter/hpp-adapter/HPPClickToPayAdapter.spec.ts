import { anyFunction, anyString, anything, instance, mock, objectContaining, verify, when } from 'ts-mockito';
import { of, Subject, throwError } from 'rxjs';
import { mapTo } from 'rxjs/operators';
import { ClickToPayPaymentMethodName } from '../../models/ClickToPayPaymentMethodName';
import { IMessageBus } from '../../../../application/core/shared/message-bus/IMessageBus';
import { IFrameQueryingService } from '../../../../shared/services/message-bus/interfaces/IFrameQueryingService';
import { DigitalTerminal } from '../../digital-terminal/DigitalTerminal';
import { PUBLIC_EVENTS } from '../../../../application/core/models/constants/EventTypes';
import { EventScope } from '../../../../application/core/models/constants/EventScope';
import { IIdentificationData } from '../../digital-terminal/interfaces/IIdentificationData';
import { IIdentificationResult } from '../../digital-terminal/interfaces/IIdentificationResult';
import { SrcNameFinder } from '../../digital-terminal/SrcNameFinder';
import { SrcName } from '../../digital-terminal/SrcName';
import { IdentificationFailureReason } from '../../digital-terminal/IdentificationFailureReason';
import { IInitialCheckoutData } from '../../digital-terminal/interfaces/IInitialCheckoutData';
import { CardListGenerator } from '../../card-list/CardListGenerator';
import { ICheckoutResponse } from '../../digital-terminal/ISrc';
import { IHPPClickToPayAdapterInitParams } from './IHPPClickToPayAdapterInitParams';
import { HPPClickToPayAdapter } from './HPPClickToPayAdapter';
import { HPPUserIdentificationService } from './HPPUserIdentificationService';
import { HPPCheckoutDataProvider } from './HPPCheckoutDataProvider';

describe('HPPClickToPayAdapter', () => {
  const initParams: IHPPClickToPayAdapterInitParams = {
    srciDpaId: '1',
    cardListContainerId: 'cardList',
    signInContainerId: 'signin',
    formId: 'formId',
    dpaTransactionOptions: null,
    onUpdateView: jest.fn(),
    onCheckout: jest.fn(),
  };
  const testCheckoutData: IInitialCheckoutData = {
    newCardData: {
      primaryAccountNumber: '111',
      cardholderFullName: 'Customer Name',
      cardSecurityCode: '123',
      panExpirationMonth: '12',
      panExpirationYear: '2049',
    },
  };
  let messageBus: IMessageBus;
  let frameQueryingServiceMock: IFrameQueryingService;
  let digitalTerminalMock: DigitalTerminal;
  let srcNameFinderMock: SrcNameFinder;
  let userIdentificationServiceMock: HPPUserIdentificationService;
  let cardListGeneratorMock: CardListGenerator;
  let hppCheckoutDataProviderMock: HPPCheckoutDataProvider;
  let formSubmitEventMock: Subject<void>;
  let sut: HPPClickToPayAdapter;

  beforeEach(() => {
    messageBus = mock<IMessageBus>();
    frameQueryingServiceMock = mock<IFrameQueryingService>();
    digitalTerminalMock = mock(DigitalTerminal);
    srcNameFinderMock = mock(SrcNameFinder);
    userIdentificationServiceMock = mock(HPPUserIdentificationService);
    cardListGeneratorMock = mock(CardListGenerator);
    hppCheckoutDataProviderMock = mock(HPPCheckoutDataProvider);
    when(digitalTerminalMock.init(anything())).thenReturn(of(undefined));
    when(digitalTerminalMock.getSrcProfiles()).thenReturn(of(undefined));
    when(digitalTerminalMock.checkout(anything())).thenReturn(of(undefined));
    when(hppCheckoutDataProviderMock.getCheckoutData(anyString())).thenReturn(of(undefined));
    when(frameQueryingServiceMock.whenReceive(PUBLIC_EVENTS.CLICK_TO_PAY_INIT, anyFunction())).thenCall((eventType, callback) => {
      callback({ type: eventType, data: initParams }).subscribe();
    });
    sut = new HPPClickToPayAdapter(
      instance(digitalTerminalMock),
      instance(messageBus),
      instance(frameQueryingServiceMock),
      instance(userIdentificationServiceMock),
      instance(srcNameFinderMock),

      instance(cardListGeneratorMock),
      instance(hppCheckoutDataProviderMock)
    );

    formSubmitEventMock = new Subject<void>();
    when(frameQueryingServiceMock.whenReceive(PUBLIC_EVENTS.CLICK_TO_PAY_CHECKOUT, anyFunction())).thenCall((eventType, callback) => {
      callback({ type: eventType, data: initParams }).subscribe();
    });
    when(hppCheckoutDataProviderMock.getCheckoutData(initParams.formId)).thenReturn(formSubmitEventMock.pipe(mapTo(testCheckoutData)));
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

    it('should subscribe to checkout data captured from form submit and perform checkout using DigitalTerminal when checkout is triggered', done => {
      sut.init(initParams).then(adapterInstance => {
          formSubmitEventMock.asObservable().subscribe(() => {
            verify(digitalTerminalMock.checkout(objectContaining({
              ...testCheckoutData,
              dpaTransactionOptions: initParams.dpaTransactionOptions,
            } as IInitialCheckoutData))).once();

            done();
          });
          formSubmitEventMock.next();
        }
      );
    });

    describe('it should subscribe to checkout response from DigitalTerminal', () => {
      it('when checkout action code is `ADD_CARD` it should open new card form in card list', done => {
        when(digitalTerminalMock.checkout(anything())).thenReturn(of({
          dcfActionCode: 'ADD_CARD',
          unbindAppInstance: false,
        } as ICheckoutResponse));

        sut.init(initParams).then(adapterInstance => {
            formSubmitEventMock.asObservable().subscribe(() => {
              verify(cardListGeneratorMock.openNewCardForm()).once();
              done();
            });
            formSubmitEventMock.next();
          }
        );
      });
    });
  });

  describe('getSrcName()', () => {
    it('should find pan using SrcNameFinder', done => {
      const pan = '4111';
      when(srcNameFinderMock.findSrcNameByPan(pan)).thenReturn(of(SrcName.VISA));

      sut.getSrcName(pan).then(srcName => {
        expect(srcName).toEqual(SrcName.VISA);
        verify(srcNameFinderMock.findSrcNameByPan(pan)).once();
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
    beforeEach(() => {
      sut.init(initParams);
    });

    it('should return response from DigitalTerminal.identifyUser() method as Promise', (done) => {
      const identificationResult: IIdentificationResult = {
        isSuccessful: true,
        failureReason: IdentificationFailureReason.OTHER,
      };
      const testData: IIdentificationData = {
        email: 'email@example.com',
      };
      when(digitalTerminalMock.identifyUser(anything(), anything())).thenReturn(of(identificationResult));
      const response = sut.identifyUser(testData);
      expect(response).toBeInstanceOf(Promise);
      response.then(result => {
        verify(digitalTerminalMock.identifyUser(anything(), testData)).once();
        expect(result).toEqual(identificationResult);
        done();
      });
    });

    it('should propagate error from DigitalTerminal.identifyUser() if any occurs', (done) => {
      const errorResponse = new Error('digital terminal error');

      when(digitalTerminalMock.identifyUser(anything(), anything())).thenReturn(throwError(() => errorResponse));
      const testData: IIdentificationData = {
        email: 'email@example.com',
      };
      const response = sut.identifyUser(testData);
      expect(response).toBeInstanceOf(Promise);
      response.catch(error => {
        verify(digitalTerminalMock.identifyUser(anything(), testData)).once();
        // eslint-disable-next-line jest/no-conditional-expect
        expect(error).toEqual(errorResponse);
      }).finally(() => done());
    });
  });
});
