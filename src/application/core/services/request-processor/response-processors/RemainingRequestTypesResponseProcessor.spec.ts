import { anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { of } from 'rxjs';
import { TransportService } from '../../st-transport/TransportService';
import { RemainingRequestTypesProvider } from '../../three-d-verification/RemainingRequestTypesProvider';
import { IThreeDQueryResponse } from '../../../models/IThreeDQueryResponse';
import { IStRequest } from '../../../models/IStRequest';
import { IRequestProcessingOptions } from '../IRequestProcessingOptions';
import { IRequestTypeResponse } from '../../st-codec/interfaces/IRequestTypeResponse';
import { RequestType } from '../../../../../shared/types/RequestType';
import { IJwtResponse } from '../../st-codec/interfaces/IJwtResponse';
import { RemainingRequestTypesResponseProcessor } from './RemainingRequestTypesResponseProcessor';

describe('RemainingRequestTypesResponseProcessor', () => {
  let remainingRequestTypesProviderMock: RemainingRequestTypesProvider;
  let transportServiceMock: TransportService;
  let remainingRequestTypesResponseProcessor: RemainingRequestTypesResponseProcessor;

  const request: IStRequest = {
    walletsource: 'googlepay',
    wallettoken: 'foobar',
  };
  const threeDQueryResponse: IThreeDQueryResponse = {
    errorcode: '0',
    acquirerresponsecode: '',
    acquirerresponsemessage: '',
    acquirertransactionreference: '',
    acsurl: '',
    enrolled: undefined,
    jwt: '',
    paymenttypedescription: undefined,
    requesttypedescription: RequestType.THREEDQUERY,
    threedversion: '',
    transactionreference: '',
    md: 'md',
    pares: 'pares',
    threedresponse: 'threedresponse',
  };
  const options: IRequestProcessingOptions = {
    jsInitResponse: undefined,
  };
  const authResponse: IRequestTypeResponse & IJwtResponse = {
    jwt: '',
    requesttypedescription: RequestType.AUTH,
  };

  beforeEach(() => {
    remainingRequestTypesProviderMock = mock(RemainingRequestTypesProvider);
    transportServiceMock = mock(TransportService);
    remainingRequestTypesResponseProcessor = new RemainingRequestTypesResponseProcessor(
      instance(remainingRequestTypesProviderMock),
      instance(transportServiceMock),
    );

    when(remainingRequestTypesProviderMock.getRemainingRequestTypes()).thenReturn(of([RequestType.AUTH]));
    when(transportServiceMock.sendRequest(anything(), anything())).thenReturn(of(authResponse));
  });

  describe('process()', () => {
    it('returns unmodified response if errorcode !== 0', done => {
      const previousResponse: IRequestTypeResponse = {
        ...threeDQueryResponse,
        errorcode: '1234',
      };

      remainingRequestTypesResponseProcessor.process(previousResponse, request, options).subscribe(result => {
        expect(result).toBe(previousResponse);
        done();
      });
    });

    it('returns unmodified response if there are no more remaining request types', done => {
      when(remainingRequestTypesProviderMock.getRemainingRequestTypes()).thenReturn(of([]));

      remainingRequestTypesResponseProcessor.process(threeDQueryResponse, request, options).subscribe(result => {
        expect(result).toBe(threeDQueryResponse);
        done();
      });
    });

    it('sends the remaining request types and returns the new response', done => {
      const previousResponse: IRequestTypeResponse = {
        ...threeDQueryResponse,
        requesttypedescription: RequestType.ACCOUNTCHECK,
      };

      remainingRequestTypesResponseProcessor.process(previousResponse, request, options).subscribe(result => {
        expect(result).toBe(authResponse);
        verify(transportServiceMock.sendRequest(request, undefined)).once();
        done();
      });
    });

    it('sends the remaining request types with 3DS verification data if previous response is a TDQ', done => {
      remainingRequestTypesResponseProcessor.process(threeDQueryResponse, request, options).subscribe(result => {
        expect(result).toBe(authResponse);

        const expectedAuthRequest = {
          ...request,
          md: 'md',
          pares: 'pares',
          threedresponse: 'threedresponse',
        };

        verify(transportServiceMock.sendRequest(deepEqual(expectedAuthRequest), undefined)).once();
        done();
      });
    });

    it('sends the remaining request types to given merchant url', done => {
      const merchantUrl = 'https://merchanturl';
      const optionsWithMerchantUrl: IRequestProcessingOptions = {
        ...options,
        merchantUrl,
      };

      remainingRequestTypesResponseProcessor.process(threeDQueryResponse, request, optionsWithMerchantUrl).subscribe(result => {
        expect(result).toBe(authResponse);
        verify(transportServiceMock.sendRequest(anything(), merchantUrl)).once();
        done();
      });
    });
  });
});
