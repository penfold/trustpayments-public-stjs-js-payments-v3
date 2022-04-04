import { anyFunction, anyString, anything, instance, mock, objectContaining, spy, verify, when } from 'ts-mockito';
import { NEVER, of, Subject, throwError } from 'rxjs';
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
import { SimpleMessageBus } from '../../../../application/core/shared/message-bus/SimpleMessageBus';
import { ofType } from '../../../../shared/services/message-bus/operators/ofType';
import { IUpdateView } from '../interfaces/IUpdateView';
import { IHPPClickToPayAdapterInitParams } from './IHPPClickToPayAdapterInitParams';
import { HPPClickToPayAdapter } from './HPPClickToPayAdapter';
import { HPPUserIdentificationService } from './HPPUserIdentificationService';
import { HPPCheckoutDataProvider } from './HPPCheckoutDataProvider';
import { HPPUpdateViewCallback } from './HPPUpdateViewCallback';
import { HPPFormFieldName } from './HPPFormFieldName';

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
  let messageBus: IMessageBus;
  let frameQueryingServiceMock: IFrameQueryingService;
  let digitalTerminalMock: DigitalTerminal;
  let srcNameFinderMock: SrcNameFinder;
  let userIdentificationServiceMock: HPPUserIdentificationService;
  let cardListGeneratorMock: CardListGenerator;
  let hppCheckoutDataProviderMock: HPPCheckoutDataProvider;
  let hppUpdateViewCallbackMock: HPPUpdateViewCallback;
  let sut: HPPClickToPayAdapter;
  let messageBusSpy;

  beforeEach(() => {
    messageBus = new SimpleMessageBus();
    frameQueryingServiceMock = mock<IFrameQueryingService>();
    digitalTerminalMock = mock(DigitalTerminal);
    srcNameFinderMock = mock(SrcNameFinder);
    userIdentificationServiceMock = mock(HPPUserIdentificationService);
    cardListGeneratorMock = mock(CardListGenerator);
    hppCheckoutDataProviderMock = mock(HPPCheckoutDataProvider);
    hppUpdateViewCallbackMock = mock(HPPUpdateViewCallback);
    when(digitalTerminalMock.init(anything())).thenReturn(of(undefined));
    when(digitalTerminalMock.getSrcProfiles()).thenReturn(of(undefined));
    when(digitalTerminalMock.checkout(anything())).thenReturn(of(undefined));
    when(hppCheckoutDataProviderMock.getCheckoutData(anyString())).thenReturn(of(undefined));
    when(hppUpdateViewCallbackMock.getUpdateViewState()).thenReturn(of({
      displayCardForm: false,
      displaySubmitForm: false,
    }));

    when(frameQueryingServiceMock.whenReceive(PUBLIC_EVENTS.CLICK_TO_PAY_INIT, anyFunction())).thenCall((eventType, callback) => {
      callback({ type: eventType, data: initParams }).subscribe();
    });

    messageBusSpy = spy(messageBus);
    sut = new HPPClickToPayAdapter(
      instance(digitalTerminalMock),
      messageBus,
      instance(frameQueryingServiceMock),
      instance(userIdentificationServiceMock),
      instance(srcNameFinderMock),
      instance(cardListGeneratorMock),
      instance(hppCheckoutDataProviderMock),
      instance(hppUpdateViewCallbackMock)
    );
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

        verify(messageBusSpy.publish(objectContaining(paymentMethodInitEvent), EventScope.THIS_FRAME)).once();
        done();
      });
    });

    describe('should subscribe to updateView state changes', () => {
      let testForm: HTMLFormElement;
      let cardInputs: Element[];
      const updateViewMock: Subject<IUpdateView> = new Subject<IUpdateView>();

      beforeEach(() => {
        testForm = document.createElement('form');
        testForm.id = initParams.formId;
        testForm.innerHTML = `
        <input type='text' name='${HPPFormFieldName.pan}'>
        <input type='text' name='${HPPFormFieldName.cardExpiryMonth}'>
        <input type='text' name='${HPPFormFieldName.cardExpiryYear}'>
        <input type='text' name='${HPPFormFieldName.cardSecurityCode}'>
        `;
        cardInputs = [HPPFormFieldName.pan, HPPFormFieldName.cardExpiryMonth, HPPFormFieldName.cardExpiryYear, HPPFormFieldName.cardSecurityCode]
          .map(name =>
            testForm.querySelector(`[name="${name}"]`));
        document.body.innerHTML = '';
        document.body.appendChild(testForm);
        when(hppUpdateViewCallbackMock.getUpdateViewState()).thenReturn(updateViewMock);
      });

      it('when card form should be hidden card fields should be set as readonly to prevent defined HTML navigation from being triggered on them', done => {
        sut.init(initParams).then((a) => {
          updateViewMock.subscribe(()=>{
            cardInputs.forEach(input => {
              expect(input.hasAttribute('readonly')).toBe(true);
            });
            done();
          })

          updateViewMock.next({
            displayCardForm: false,
            displaySubmitForm: false,
          });
        });
      });

      it('when card form should not be hidden card fields should have "readonly" attribute removed', done => {
        sut.init(initParams).then(() => {
          updateViewMock.subscribe(()=>{
            cardInputs.forEach(input => {
              expect(input.hasAttribute('readonly')).toBe(false);
            });
            done();
          })

          updateViewMock.next({
            displayCardForm: true,
            displaySubmitForm: false,
          });
        });
      });
    });

    it('should subscribe to checkout data captured from form submit and perform checkout using DigitalTerminal when checkout is triggered', done => {
      const formSubmitEventMock: Subject<void> = new Subject();
      const testCheckoutData: IInitialCheckoutData = {
        newCardData: {
          primaryAccountNumber: '111',
          cardholderFullName: 'Customer Name',
          cardSecurityCode: '123',
          panExpirationMonth: '12',
          panExpirationYear: '2049',
        },
      };
      when(frameQueryingServiceMock.whenReceive(PUBLIC_EVENTS.CLICK_TO_PAY_CHECKOUT, anyFunction())).thenCall((eventType, callback) => {
        callback({ type: eventType, data: initParams }).subscribe();
      });
      when(hppCheckoutDataProviderMock.getCheckoutData(initParams.formId)).thenReturn(formSubmitEventMock.pipe(mapTo(testCheckoutData)));
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
