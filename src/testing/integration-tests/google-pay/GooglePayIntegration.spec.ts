import { first } from 'rxjs/operators';
import { of, zip } from 'rxjs';
import Container from 'typedi';
import { HttpClient } from '@trustpayments/http-client';
import { anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { PUBLIC_EVENTS } from '../../../application/core/models/constants/EventTypes';
import { IInitPaymentMethod } from '../../../application/core/services/payments/events/IInitPaymentMethod';
import { PaymentController } from '../../../application/core/services/payments/PaymentController';
import { DomMethods } from '../../../application/core/shared/dom-methods/DomMethods';
import { IMessageBus } from '../../../application/core/shared/message-bus/IMessageBus';
import { GooglePaymentMethod } from '../../../integrations/google-pay/application/GooglePaymentMethod';
import { ConfigProviderToken, MessageBusToken } from '../../../shared/dependency-injection/InjectionTokens';
import { IConfig } from '../../../shared/model/config/IConfig';
import { TestConfigProvider } from '../../mocks/TestConfigProvider';
import { GooglePaymentMethodName } from '../../../integrations/google-pay/models/IGooglePaymentMethod';
import { JwtReducer } from '../../../application/core/store/reducers/jwt/JwtReducer';
import { TransportService } from '../../../application/core/services/st-transport/TransportService';
import { PaymentResultSubmitterSubscriber } from '../../../client/common-frames/PaymentResultSubmitterSubscriber';
import { googlePayConfigMock } from '../../../client/integrations/google-pay/GooglePayConfigMock';
import { GooglePayClientInitializer } from '../../../client/integrations/google-pay/google-pay-client-initializer/GooglePayClientInitializer';
import { IGooglePayGatewayRequest } from '../../../integrations/google-pay/models/IGooglePayRequest';
import { PaymentStatus } from '../../../application/core/services/payments/PaymentStatus';
import { IRequestTypeResponse } from '../../../application/core/services/st-codec/interfaces/IRequestTypeResponse';
import { IStRequest } from '../../../application/core/models/IStRequest';
import { ofType } from '../../../shared/services/message-bus/operators/ofType';
import { IThreeDVerificationService } from '../../../application/core/services/three-d-verification/IThreeDVerificationService';
import { IGatewayClient } from '../../../application/core/services/gateway-client/IGatewayClient';
import { TransportServiceGatewayClient } from '../../../application/core/services/gateway-client/TransportServiceGatewayClient';
import { GooglePaySessionPaymentsClientMock } from './GooglePaySessionClientMock';

describe.skip('GooglePay Payment', () => {
  let paymentController: PaymentController;
  let configProvider: TestConfigProvider;
  let messageBus: IMessageBus;
  let config: IConfig;
  let paymentResultSubmitterSubscriber: PaymentResultSubmitterSubscriber;
  let googlePayInitializeSubscriber: GooglePayClientInitializer;
  let googlePaySessionPaymentsClientMock: GooglePaySessionPaymentsClientMock;
  let transportServiceMock: TransportService;
  let threeDVerificationServiceMock: IThreeDVerificationService<unknown>;

  beforeEach(() => {
    transportServiceMock = mock(TransportService);
    threeDVerificationServiceMock = mock<IThreeDVerificationService<unknown>>();
    when(transportServiceMock.sendRequest(anything(), anything())).thenReturn(
      of({
        transactionstartedtimestamp: '123',
        errormessage: 'Ok',
        errorcode: '0',
        requesttypedescription: 'AUTH',
        customeroutput: 'RESULT',
        jwt: 'jwt',
      })
    );
    Container.set(TransportService, instance(transportServiceMock));
    Container.set({ id: PaymentResultSubmitterSubscriber, type: PaymentResultSubmitterSubscriber });
    Container.set({ id: GooglePayClientInitializer, type: GooglePayClientInitializer });
    Container.set({ id: HttpClient, type: HttpClient });
    Container.set({ id: IThreeDVerificationService, value: instance(threeDVerificationServiceMock) });
    Container.set({ id: IGatewayClient, type: TransportServiceGatewayClient });
    Container.import([JwtReducer, GooglePaymentMethod]);
    paymentController = Container.get(PaymentController);
    configProvider = Container.get(ConfigProviderToken) as TestConfigProvider;
    messageBus = Container.get(MessageBusToken);
    paymentResultSubmitterSubscriber = Container.get(PaymentResultSubmitterSubscriber);
    googlePayInitializeSubscriber = Container.get(GooglePayClientInitializer);
    googlePaySessionPaymentsClientMock = new GooglePaySessionPaymentsClientMock();
    DomMethods.insertScript = jest.fn().mockImplementation(() => {
      return Promise.resolve(document.createElement('script'));
    });

    config = {
      formId: 'st-form',
      submitFields: ['baz', 'xyz'],
      submitOnError: false,
      jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2MTk1MDU3NzAsImlzcyI6ImpzbGlicmFyeWp3dCIsInBheWxvYWQiOnsibWFpbmFtb3VudCI6IjIwLjAwIiwiYWNjb3VudHR5cGVkZXNjcmlwdGlvbiI6IkVDT00iLCJjdXJyZW5jeWlzbzNhIjoiR0JQIiwic2l0ZXJlZmVyZW5jZSI6InRlc3RfamFtZXMzODY0MSIsInJlcXVlc3R0eXBlZGVzY3JpcHRpb25zIjpbIkFVVEgiXSwidGhyZWVkYnlwYXNzcGF5bWVudHR5cGVzIjpbXSwibG9jYWxlIjoiZW5fR0IifX0.hF4Itxns9FUCRlRYxOVDymKVAqTxkweJIs2YXg9vCf8',
      disableNotification: false,
      livestatus: 0,
      datacenterurl: 'https://example.com',
      visaCheckout: null,
      googlePay: googlePayConfigMock,
    };

    document.body.appendChild((DomMethods.createHtmlElement({ id: 'st-form' }, 'form') as HTMLFormElement));
    const googlePayNode = document.createElement('div');
    googlePayNode.id = 'st-google-pay';
    document.getElementById('st-form').appendChild(googlePayNode);
    configProvider.setConfig(config);
    paymentResultSubmitterSubscriber.register(messageBus);
    googlePayInitializeSubscriber.register(messageBus);
    paymentController.init();
  });

  describe('GooglePay Success Payment', () => {
    beforeEach(() => {
      googlePaySessionPaymentsClientMock.mockPaymentData('success');
      // @ts-ignore
      window.google = {
        payments: {
          api: {
            PaymentsClient: jest.fn().mockImplementation(() => {
              return googlePaySessionPaymentsClientMock;
            }),
          },
        },
      };
    });

    it('runs a google pay payment method and when finished calls success callback', done => {
      zip(
        messageBus.pipe(ofType(PUBLIC_EVENTS.CALL_MERCHANT_SUBMIT_CALLBACK)),
        messageBus.pipe(ofType(PUBLIC_EVENTS.CALL_MERCHANT_SUCCESS_CALLBACK))
      )
        .pipe(first())
        .subscribe(([submitCallbackEvent, successCallbackEvent]) => {
          const expectedResultData: IRequestTypeResponse = {
            transactionstartedtimestamp: '123',
            errormessage: 'Ok',
            errorcode: '0',
            requesttypedescription: 'AUTH',
            customeroutput: 'RESULT',
            jwt: 'jwt',
          };

          expect(submitCallbackEvent).toEqual({
            type: PUBLIC_EVENTS.CALL_MERCHANT_SUBMIT_CALLBACK,
            data: expectedResultData,
          });

          expect(successCallbackEvent).toEqual({
            type: PUBLIC_EVENTS.CALL_MERCHANT_SUCCESS_CALLBACK,
            data: expectedResultData,
          });

          const requestData: IStRequest = {
            walletsource: 'GOOGLEPAY',
            wallettoken:
              '{"apiVersion":2,"apiVersionMinor":0,"paymentMethodData":{"description":"Mastercard •••• 4444","info":{"cardDetails":"4444","cardNetwork":"MASTERCARD"}},"tokenizationData":{"token":"sometoken","type":"PAYMENT_GATEWAY"},"type":"CARD"}',
            termurl: 'https://termurl.com',
          };

          verify(transportServiceMock.sendRequest(deepEqual(requestData), anything())).once();

          done();
        });

      messageBus.publish<IInitPaymentMethod<IConfig>>({
        type: PUBLIC_EVENTS.INIT_PAYMENT_METHOD,
        data: { name: GooglePaymentMethodName, config },
      });

      setTimeout(() => {
        document.getElementById('gp-mocked-button').click();
      }, 1000);
    });
  });

  describe('GooglePay Error Payment', () => {
    beforeEach(() => {
      googlePaySessionPaymentsClientMock.mockPaymentData('error');
      // @ts-ignore
      window.google = {
        payments: {
          api: {
            PaymentsClient: jest.fn().mockImplementation(() => {
              return googlePaySessionPaymentsClientMock;
            }),
          },
        },
      };
    });
    it('runs a google pay payment method, causes an error and calls error callback', done => {
      zip(
        messageBus.pipe(ofType(PUBLIC_EVENTS.CALL_MERCHANT_SUBMIT_CALLBACK)),
        messageBus.pipe(ofType(PUBLIC_EVENTS.CALL_MERCHANT_ERROR_CALLBACK))
      )
        .pipe(first())
        .subscribe(([submitCallbackEvent, errorCallbackEvent]) => {
          const resultData: IGooglePayGatewayRequest = {
            errorcode: '1',
            walletsource: 'GOOGLEPAY',
            errormessage: PaymentStatus.ERROR,
          };

          expect(submitCallbackEvent).toEqual({
            type: PUBLIC_EVENTS.CALL_MERCHANT_SUBMIT_CALLBACK,
            data: resultData,
          });

          expect(errorCallbackEvent).toEqual({
            type: PUBLIC_EVENTS.CALL_MERCHANT_ERROR_CALLBACK,
            data: resultData,
          });

          verify(transportServiceMock.sendRequest(anything(), anything())).never();

          done();
        });

      messageBus.publish<IInitPaymentMethod<IConfig>>({
        type: PUBLIC_EVENTS.INIT_PAYMENT_METHOD,
        data: { name: GooglePaymentMethodName, config },
      });

      setTimeout(() => {
        document.getElementById('gp-mocked-button').click();
      }, 1000);
    });
  });
});
