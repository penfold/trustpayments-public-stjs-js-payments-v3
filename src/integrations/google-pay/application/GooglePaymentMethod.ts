import { from, Observable, of } from 'rxjs';
import { Inject, Service } from 'typedi';
import { IPaymentMethod } from '../../../application/core/services/payments/IPaymentMethod';
import { IPaymentResult } from '../../../application/core/services/payments/IPaymentResult';
import { CPFThreeDProcess, PaymentMethodToken } from '../../../application/dependency-injection/InjectionTokens';
import { GooglePaymentMethodName } from '../models/IGooglePaymentMethod';
import { map, switchMap } from 'rxjs/operators';
import { IGooglePayGatewayRequest } from '../models/IGooglePayRequest';
import { IRequestTypeResponse } from '../../../application/core/services/st-codec/interfaces/IRequestTypeResponse';
import { GetPaymentStatus } from '../../../application/core/services/payments/PaymentStatus';
import { GooglePayConfigName, IGooglePayConfig } from '../models/IGooglePayConfig';
import { ThreeDProcess } from '../../../application/core/services/three-d-verification/ThreeDProcess';
import { IThreeDQueryResponse } from '../../../application/core/models/IThreeDQueryResponse';
import { IStRequest } from '../../../application/core/models/IStRequest';
import { Cybertonica } from '../../../application/core/integrations/cybertonica/Cybertonica';
import { RemainingRequestTypesProvider } from '../../../application/core/services/three-d-verification/RemainingRequestTypesProvider';
import { TransportServiceGatewayClient } from '../../../application/core/services/gateway-client/TransportServiceGatewayClient';
import { IGatewayClient } from '../../../application/core/services/gateway-client/IGatewayClient';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';

@Service({ id: PaymentMethodToken, multiple: true })
export class GooglePaymentMethod implements IPaymentMethod<IGooglePayConfig, IGooglePayGatewayRequest, IRequestTypeResponse> {
  constructor(
    @Inject(CPFThreeDProcess) private threeDProcess: ThreeDProcess,
    private remainingRequestTypesProvider: RemainingRequestTypesProvider,
    private cybertonica: Cybertonica,
    @Inject(() => TransportServiceGatewayClient) private gatewayClient: IGatewayClient,
    private configProvider: ConfigProvider,
  ) {}

  getName(): string {
    return GooglePaymentMethodName;
  }

  init(): Observable<void> {
    return this.threeDProcess.init();
  }

  start(data: IGooglePayGatewayRequest): Observable<IPaymentResult<IRequestTypeResponse>> {
    return this.appendCybertonicaTid(data).pipe(
      switchMap(requestData => of(requestData).pipe(
        switchMap(requestData => this.performThreeDQueryRequest(requestData)),
        switchMap(response => this.performAuthRequest(requestData, response)),
      )),
      map(response => ({
        status: data.resultStatus || GetPaymentStatus(response.errorcode),
        data: response,
      })),
    );
  }

  private performThreeDQueryRequest(requestData: IGooglePayGatewayRequest): Observable<IThreeDQueryResponse> {
    return this.remainingRequestTypesProvider.getRemainingRequestTypes().pipe(
      switchMap(requestTypes => this.threeDProcess.performThreeDQuery(requestTypes, null, requestData, this.getMerchantUrl())),
    );
  }

  private performAuthRequest(
    initialRequest: IGooglePayGatewayRequest,
    previousResponse: IThreeDQueryResponse
  ): Observable<IRequestTypeResponse> {
    return this.remainingRequestTypesProvider.getRemainingRequestTypes().pipe(
      switchMap(requestTypes => {
        if (requestTypes.length === 0) {
          return of(previousResponse);
        }

        const requestData: IStRequest = {
          ...initialRequest,
          cachetoken: previousResponse.cachetoken,
          threedresponse: previousResponse.threedresponse,
        }

        return this.gatewayClient.auth(requestData, this.getMerchantUrl());
      }),
    );
  }

  private appendCybertonicaTid(request: IGooglePayGatewayRequest): Observable<IGooglePayGatewayRequest> {
    return from(this.cybertonica.getTransactionId()).pipe(
      map(cybertonicaTid => cybertonicaTid ? { ...request, fraudcontroltransactionid: cybertonicaTid } : request),
    );
  }

  private getMerchantUrl(): string {
    return this.configProvider.getConfig()[GooglePayConfigName].merchantUrl;
  }
}
