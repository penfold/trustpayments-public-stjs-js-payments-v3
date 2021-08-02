import { ThreeDProcess } from '../../../application/core/services/three-d-verification/ThreeDProcess';
import { Cybertonica } from '../../../application/core/integrations/cybertonica/Cybertonica';
import { GooglePaymentMethod } from './GooglePaymentMethod';
import { anything, capture, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { GooglePaymentMethodName } from '../models/IGooglePaymentMethod';
import { of } from 'rxjs';
import { RemainingRequestTypesProvider } from '../../../application/core/services/three-d-verification/RemainingRequestTypesProvider';
import { RequestType } from '../../../shared/types/RequestType';
import { IThreeDQueryResponse } from '../../../application/core/models/IThreeDQueryResponse';
import { IGooglePayGatewayRequest } from '../models/IGooglePayRequest';
import { PaymentStatus } from '../../../application/core/services/payments/PaymentStatus';
import { IRequestTypeResponse } from '../../../application/core/services/st-codec/interfaces/IRequestTypeResponse';
import { IJwtResponse } from '../../../application/core/services/st-codec/interfaces/IJwtResponse';
import { IGatewayClient } from '../../../application/core/services/gateway-client/IGatewayClient';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { GooglePayConfigName, IGooglePayConfig } from '../models/IGooglePayConfig';

describe('GooglePaymentMethod', () => {
  let threeDProcessMock: ThreeDProcess;
  let remainigRequestTypesProviderMock: RemainingRequestTypesProvider;
  let cybertonicaMock: Cybertonica;
  let gatewayClientMock: IGatewayClient;
  let configProviderMock: ConfigProvider;
  let googlePaymentMethod: GooglePaymentMethod;

  const threeDQueryResponse: IThreeDQueryResponse = {
    errorcode: '0',
    acquirerresponsecode: '',
    acquirerresponsemessage: '',
    acquirertransactionreference: '',
    acsurl: '',
    enrolled: '',
    jwt: '',
    requesttypedescription: '',
    threedpayload: '',
    transactionreference: '',
    cachetoken: 'cachetoken',
    threedresponse: 'threedresponse',
    threedversion: '2.1.0',
  };

  const googlePayGatewayRequest: IGooglePayGatewayRequest = {
    walletsource: 'GOOGLE_PAY',
    wallettoken: 'wallettoken',
  };

  beforeEach(() => {
    threeDProcessMock = mock(ThreeDProcess);
    remainigRequestTypesProviderMock = mock(RemainingRequestTypesProvider);
    cybertonicaMock = mock(Cybertonica);
    gatewayClientMock = mock<IGatewayClient>();
    configProviderMock = mock<ConfigProvider>();
    googlePaymentMethod = new GooglePaymentMethod(
      instance(threeDProcessMock),
      instance(remainigRequestTypesProviderMock),
      instance(cybertonicaMock),
      instance(gatewayClientMock),
      instance(configProviderMock),
    );

    when(threeDProcessMock.init$()).thenReturn(of(undefined));
    when(threeDProcessMock.performThreeDQuery$(anything(), anything(), anything())).thenReturn(of(threeDQueryResponse));
    when(cybertonicaMock.getTransactionId()).thenResolve(undefined);
    when(configProviderMock.getConfig()).thenReturn({ [GooglePayConfigName]: {} as IGooglePayConfig });
  });

  describe('getName()', () => {
    it('returns GooglePaymentMethod name', () => {
      expect(googlePaymentMethod.getName()).toBe(GooglePaymentMethodName);
    });
  });

  describe('init()', () => {
    it('initializes 3D process', done => {
      googlePaymentMethod.init().subscribe(() => {
        verify(threeDProcessMock.init$()).once();
        done();
      });
    });
  });

  describe('start()', () => {
    describe('frictionless payments - with single request to gateway', () => {
      beforeEach(() => {
        when(remainigRequestTypesProviderMock.getRemainingRequestTypes()).thenReturn(
          of([RequestType.THREEDQUERY, RequestType.AUTH]),
          of([]),
        );
      });

      it('performs TDQ process and returns the PaymentResult if there are no remaining request types', done => {
        googlePaymentMethod.start(googlePayGatewayRequest).subscribe(result => {
          expect(result).toEqual({
            status: PaymentStatus.SUCCESS,
            data: threeDQueryResponse,
          });

          verify(threeDProcessMock.performThreeDQuery$(
            deepEqual([RequestType.THREEDQUERY, RequestType.AUTH]),
            null,
            deepEqual(googlePayGatewayRequest),
          )).once();

          done();
        });
      });

      it('appends cybertonica TID to TDQ request', done => {
        when(cybertonicaMock.getTransactionId()).thenResolve('cybertonicatid');

        googlePaymentMethod.start(googlePayGatewayRequest).subscribe(() => {
          const [requestTypes, card, merchantData] = capture(threeDProcessMock.performThreeDQuery$).last();

          expect(merchantData).toEqual({
            ...googlePayGatewayRequest,
            fraudcontroltransactionid: 'cybertonicatid',
          });

          done();
        });
      });

      it('returns payment result with error status if errorcode != 0', done => {
        const errorResponse: IThreeDQueryResponse = { ...threeDQueryResponse, errorcode: '1234' };

        when(threeDProcessMock.performThreeDQuery$(anything(), anything(), anything())).thenReturn(of(errorResponse));

        googlePaymentMethod.start(googlePayGatewayRequest).subscribe(result => {
          expect(result).toEqual({
            status: PaymentStatus.ERROR,
            data: errorResponse,
          });
          done();
        });
      });

      it('returns payment result with predefined status', done => {
        const request: IGooglePayGatewayRequest = {
          ...googlePayGatewayRequest,
          resultStatus: PaymentStatus.FAILURE,
        };

        googlePaymentMethod.start(request).subscribe(result => {
          expect(result).toEqual({
            status: PaymentStatus.FAILURE,
            data: threeDQueryResponse,
          });
          done();
        });
      });

      it.skip('starts the 3DS process with configured merchantUrl', () => {
        when(configProviderMock.getConfig()).thenReturn({
          [GooglePayConfigName]: {
            merchantUrl: 'https://merchant.url',
          } as IGooglePayConfig,
        });

        googlePaymentMethod.start(googlePayGatewayRequest).subscribe(() => {
          verify(threeDProcessMock.performThreeDQuery$(
            anything(),
            anything(),
            anything(),
          )).once();
        });
      });
    });

    describe('step-up payments - with second request to gateway', () => {
      const authResponse: IRequestTypeResponse & IJwtResponse = {
        jwt: '',
        customeroutput: '',
        errorcode: '0',
        errordata: '',
        errormessage: '',
        requesttypedescription: 'AUTH',
        transactionstartedtimestamp: '',
      };

      beforeEach(() => {
        when(remainigRequestTypesProviderMock.getRemainingRequestTypes()).thenReturn(
          of([RequestType.THREEDQUERY, RequestType.AUTH]),
          of([RequestType.AUTH]),
        );

        when(gatewayClientMock.auth(anything(), anything())).thenReturn(of(authResponse));
      });

      it('sends the AUTH request to the gateway and returns the PaymentResult', done => {
        googlePaymentMethod.start(googlePayGatewayRequest).subscribe(result => {
          expect(result).toEqual({
            status: PaymentStatus.SUCCESS,
            data: authResponse,
          });

          verify(gatewayClientMock.auth(deepEqual({
            ...googlePayGatewayRequest,
            cachetoken: 'cachetoken',
            threedresponse: 'threedresponse',
          }), undefined)).once();

          done();
        });
      });

      it('sends the cybertonica TID with AUTH request', done => {
        when(cybertonicaMock.getTransactionId()).thenResolve('cybertonicatid');

        googlePaymentMethod.start(googlePayGatewayRequest).subscribe(() => {
          verify(gatewayClientMock.auth(deepEqual({
            ...googlePayGatewayRequest,
            cachetoken: 'cachetoken',
            threedresponse: 'threedresponse',
            fraudcontroltransactionid: 'cybertonicatid',
          }), anything())).once();
          done();
        });
      });

      it('returns payment result with error status if errorcode != 0', done => {
        const errorResponse: typeof authResponse = { ...authResponse, errorcode: '1234' };

        when(gatewayClientMock.auth(anything(), anything())).thenReturn(of(errorResponse));

        googlePaymentMethod.start(googlePayGatewayRequest).subscribe(result => {
          expect(result).toEqual({
            status: PaymentStatus.ERROR,
            data: errorResponse,
          });
          done();
        });
      });

      it('returns payment result with predefined status', done => {
        const request: IGooglePayGatewayRequest = {
          ...googlePayGatewayRequest,
          resultStatus: PaymentStatus.FAILURE,
        };

        googlePaymentMethod.start(request).subscribe(result => {
          expect(result).toEqual({
            status: PaymentStatus.FAILURE,
            data: authResponse,
          });
          done();
        });
      });

      it('runs the auth request with configured merchantUrl', done => {
        when(configProviderMock.getConfig()).thenReturn({
          [GooglePayConfigName]: {
            merchantUrl: 'https://merchant.url',
          } as IGooglePayConfig,
        });

        googlePaymentMethod.start(googlePayGatewayRequest).subscribe(() => {
          verify(gatewayClientMock.auth(anything(), 'https://merchant.url')).once();
          done();
        });
      });
    });
  });
});
