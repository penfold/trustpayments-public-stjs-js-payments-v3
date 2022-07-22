import { anyFunction, anyString, anything, instance, mock, objectContaining, spy, verify, when } from 'ts-mockito';
import { of, Subject, throwError } from 'rxjs';
import { first, mapTo } from 'rxjs/operators';
import faker from '@faker-js/faker';
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
import { IUpdateView } from '../interfaces/IUpdateView';
import { DcfActionCode, ICheckoutResponse } from '../../digital-terminal/ISrc';
import { IAggregatedProfiles } from '../../digital-terminal/interfaces/IAggregatedProfiles';
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
  const srcProfilesMock: IAggregatedProfiles = {
    aggregatedCards: [],
    srcProfiles: null,
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
    when(digitalTerminalMock.unbindAppInstance()).thenReturn(of(undefined));
    when(digitalTerminalMock.init(anything())).thenReturn(of(undefined));
    when(digitalTerminalMock.getSrcProfiles()).thenReturn(of(srcProfilesMock));
    when(digitalTerminalMock.checkout(anything())).thenReturn(of({
          idToken: 'idtoken',
          unbindAppInstance: false,
          dcfActionCode: DcfActionCode.addCard,
          checkoutResponse: 'response',
        }
      )
    );
    when(hppCheckoutDataProviderMock.getCheckoutData(anyString())).thenReturn(of(undefined));
    when(hppUpdateViewCallbackMock.getUpdateViewState()).thenReturn(of({
      displayCardForm: false,
      displaySubmitButton: false,
      displayMaskedCardNumber: null,
      displayCardType: null,
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
        <input type="text" name="${HPPFormFieldName.pan}">
        <input type="text" name="${HPPFormFieldName.cardExpiryMonth}">
        <input type="text" name="${HPPFormFieldName.cardExpiryYear}">
        <input type="text" name="${HPPFormFieldName.cardSecurityCode}">
        `;
        cardInputs = [HPPFormFieldName.pan, HPPFormFieldName.cardExpiryMonth, HPPFormFieldName.cardExpiryYear, HPPFormFieldName.cardSecurityCode]
          .map(name =>
            testForm.querySelector(`[name="${name}"]`));
        document.body.innerHTML = '';
        document.body.appendChild(testForm);
        when(hppUpdateViewCallbackMock.getUpdateViewState()).thenReturn(updateViewMock);
      });

      it('when card form should be hidden card fields should be set as readonly and disabled to prevent defined HTML navigation from being triggered on them', done => {
        sut.init(initParams).then((a) => {
          updateViewMock.subscribe(() => {
            cardInputs.forEach(input => {
              expect(input.hasAttribute('readonly')).toBe(true);
              expect(input.hasAttribute('disabled')).toBe(true);
            });
            done();
          });

          updateViewMock.next({
            displayCardForm: false,
            displaySubmitButton: false,
            displayMaskedCardNumber: null,
            displayCardType: null,
          });
        });
      });

      it('when card form should not be hidden card fields should have "readonly"  and "disabled" attributes removed', done => {
        sut.init(initParams).then(() => {
          updateViewMock.subscribe(() => {
            cardInputs.forEach(input => {
              expect(input.hasAttribute('readonly')).toBe(false);
              expect(input.hasAttribute('disabled')).toBe(false);
            });
            done();
          });

          updateViewMock.next({
            displayCardForm: true,
            displayCardType: null,
            displayMaskedCardNumber: null,
            displaySubmitButton: false,
          });
        });
      });
    });

    describe('should subscribe to checkout data captured from form submit and', () => {
      const formSubmitEventMock = new Subject<void>();
      const testCheckoutData: IInitialCheckoutData = {
        newCardData: {
          primaryAccountNumber: '111',
          cardholderFullName: 'Customer Name',
          cardSecurityCode: '123',
          panExpirationMonth: '12',
          panExpirationYear: '2049',
        },
      };
      const expectedInitialCheckoutData: IInitialCheckoutData = {
        ...testCheckoutData,
        dpaTransactionOptions: initParams.dpaTransactionOptions,
      };

      beforeEach(() => {
        when(frameQueryingServiceMock.whenReceive(PUBLIC_EVENTS.CLICK_TO_PAY_CHECKOUT, anyFunction())).thenCall((eventType, callback) => {
          callback({ type: eventType, data: initParams }).subscribe();
        });
        when(hppCheckoutDataProviderMock.getCheckoutData(initParams.formId)).thenReturn(formSubmitEventMock.pipe(mapTo(testCheckoutData)));
      });

      it('perform checkout using DigitalTerminal when checkout is triggered', done => {

        sut.init(initParams).then(adapterInstance => {
            formSubmitEventMock.asObservable().subscribe(() => {
              verify(digitalTerminalMock.checkout(objectContaining(expectedInitialCheckoutData))).once();

              done();
            });
            formSubmitEventMock.next();
          }
        );
      });

      it(`when checkout response contains dcfActionCode = ${DcfActionCode.addCard} it should enable new card list form in card list view`, done => {
        const mockCheckoutResponse: ICheckoutResponse = {
          checkoutResponse: '',
          dcfActionCode: DcfActionCode.addCard,
          unbindAppInstance: false,
          idToken: '',
        };
        when(digitalTerminalMock.checkout(anything())).thenReturn(of(mockCheckoutResponse));

        sut.init(initParams).then(adapterInstance => {
            formSubmitEventMock.asObservable().subscribe(() => {
              verify(cardListGeneratorMock.openNewCardForm()).once();

              done();
            });
            formSubmitEventMock.next();
          }
        );
      });

      describe.each([DcfActionCode.cancel])('when checkout response contains dcfActionCode = %s', dcfCode => {
        const mockCheckoutResponse: ICheckoutResponse = {
          checkoutResponse: '',
          dcfActionCode: dcfCode,
          unbindAppInstance: false,
          idToken: '',
        };
        const checkoutResultSubject: Subject<any> = new Subject<any>();

        beforeEach(() => {

          when(digitalTerminalMock.isRecognized()).thenReturn(of(true));
          when(digitalTerminalMock.checkout(anything())).thenReturn(of(mockCheckoutResponse));
          when(digitalTerminalMock.unbindAppInstance()).thenReturn(of(undefined));
          when(frameQueryingServiceMock.whenReceive(PUBLIC_EVENTS.CLICK_TO_PAY_CHECKOUT, anyFunction())).thenCall((eventType, callback) => {
            callback({
              type: eventType,
              data: initParams,
            }).subscribe(checkoutResult => checkoutResultSubject.next(checkoutResult));
          });
        });

        it('should display card list again if response contains idToken', done => {
          when(digitalTerminalMock.getSrcProfiles()).thenReturn(of(srcProfilesMock));
          when(digitalTerminalMock.checkout(anything())).thenReturn(of({
            ...mockCheckoutResponse,
            idToken: faker.datatype.uuid(),
          }));

          sut.init(initParams).then(adapterInstance => {
            checkoutResultSubject.pipe(first()).subscribe((result) => {
              verify(digitalTerminalMock.getSrcProfiles()).once();
              verify(cardListGeneratorMock.displayCards(initParams.formId, initParams.cardListContainerId, srcProfilesMock.aggregatedCards)).once();
              done();
            });
            formSubmitEventMock.next();
          });
        });
      });

      it('when checkout response contains unbindAppInstance = true it should unbind instance using Digital Terminal and hide card list, regardless of returned ddcfActionCode', done => {
        const mockCheckoutResponse: ICheckoutResponse = {
          checkoutResponse: '',
          dcfActionCode: DcfActionCode.switchConsumer,
          unbindAppInstance: true,
          idToken: '',
        };
        when(digitalTerminalMock.checkout(objectContaining(expectedInitialCheckoutData))).thenReturn(of(mockCheckoutResponse));
        when(digitalTerminalMock.unbindAppInstance()).thenReturn(of(undefined));

        sut.init(initParams).then(adapterInstance => {
            formSubmitEventMock.asObservable().subscribe(() => {
              verify(digitalTerminalMock.unbindAppInstance()).once();
              verify(cardListGeneratorMock.hideForm()).once();
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

    it(`should subscribe to message bus event ${PUBLIC_EVENTS.CLICK_TO_PAY_INIT}, run initAdapter method and return Promise with reference to adapter `
      , done => {
        sut.init(initParams).then((adapterReference) => {
          verify(frameQueryingServiceMock.whenReceive(PUBLIC_EVENTS.CLICK_TO_PAY_INIT, anyFunction())).once();
          verify(digitalTerminalMock.init(initParams)).once();
          expect(adapterReference).toEqual(sut);
          done();
        });
      });

    describe('showCardList()', () => {
      const mockSrcProfiles: IAggregatedProfiles = {
        srcProfiles: null,
        aggregatedCards: [{
          srcDigitalCardId: '1',
          idToken: '1',
          dateOfCardCreated: null,
          dcf: null,
          srcCorrelationId: 'scrCorrelationId',
          srcName: SrcName.VISA,
          dateOfCardLastUsed: null,
          digitalCardData: null,
          isActive: null,
          maskedBillingAddress: null,
          panBin: null,
          panExpirationMonth: null,
          panExpirationYear: null,
          panLastFour: null,
          paymentAccountReference: null,
          tokenBinRange: null,
          tokenLastFour: null,
        }],
      };
      beforeEach(() => {
        when(digitalTerminalMock.getSrcProfiles()).thenReturn(of(mockSrcProfiles));
        sut.init(initParams);
      });

      it('should display list of cards of recognized user in container with id provided in init data', () => {
        sut.showCardList();
        verify(digitalTerminalMock.getSrcProfiles()).atLeast(1);
        verify(cardListGeneratorMock.displayCards(initParams.formId, initParams.cardListContainerId, objectContaining(mockSrcProfiles.aggregatedCards))).once();
      });

      it('should display recognized user details element', () => {
        sut.showCardList();
        verify(digitalTerminalMock.getSrcProfiles()).atLeast(1);
        verify(cardListGeneratorMock.displayUserInformation(initParams.cardListContainerId, objectContaining(mockSrcProfiles.srcProfiles))).once();
      });
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
});
