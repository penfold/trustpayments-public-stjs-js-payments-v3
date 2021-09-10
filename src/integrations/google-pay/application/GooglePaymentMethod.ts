import { Observable, of, throwError } from 'rxjs';
import { catchError, map, mapTo, switchMap } from 'rxjs/operators';
import { Service } from 'typedi';
import { IPaymentMethod } from '../../../application/core/services/payments/IPaymentMethod';
import { IPaymentResult } from '../../../application/core/services/payments/IPaymentResult';
import { PaymentStatus } from '../../../application/core/services/payments/PaymentStatus';
import { IRequestProcessingService } from '../../../application/core/services/request-processor/IRequestProcessingService';
import { RequestProcessingInitializer } from '../../../application/core/services/request-processor/RequestProcessingInitializer';
import { IRequestTypeResponse } from '../../../application/core/services/st-codec/interfaces/IRequestTypeResponse';
import { PaymentMethodToken } from '../../../application/dependency-injection/InjectionTokens';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { GooglePayConfigName, IGooglePayConfig } from '../models/IGooglePayConfig';
import { GooglePaymentMethodName } from '../models/IGooglePaymentMethod';
import { IGooglePayGatewayRequest } from '../models/IGooglePayRequest';

@Service({ id: PaymentMethodToken, multiple: true })
export class GooglePaymentMethod implements IPaymentMethod<IGooglePayConfig, IGooglePayGatewayRequest, IRequestTypeResponse> {
  private requestProcessingService: Observable<IRequestProcessingService>;

  constructor(
    private requestProcessingInitializer: RequestProcessingInitializer,
    private configProvider: ConfigProvider,
  ) {
  }

  getName(): string {
    return GooglePaymentMethodName;
  }

  init(): Observable<void> {
    this.requestProcessingService = this.requestProcessingInitializer.initialize();

    return this.requestProcessingService.pipe(mapTo(undefined));
  }

  start(data: IGooglePayGatewayRequest): Observable<IPaymentResult<IRequestTypeResponse>> {
    return this.requestProcessingService.pipe(
      switchMap(requestProcessingService => {
        const merchantUrl = this.configProvider.getConfig()[GooglePayConfigName].merchantUrl;

        return requestProcessingService.process(data, merchantUrl);
      }),
      map(response => this.mapPaymentResponse(response, data)),
      catchError(response => this.handleResponseError(response, data))
    );
  }

  private handleResponseError(responseOrError, data: IGooglePayGatewayRequest) {
    if(!responseOrError.requesttypedescription) {
      return throwError(responseOrError);
    }

    return of({
      status: data.resultStatus || this.resolvePaymentStatus(responseOrError),
      data: responseOrError,
    });
  }

  private mapPaymentResponse(
    response: IRequestTypeResponse,
    request: IGooglePayGatewayRequest
  ): IPaymentResult<IRequestTypeResponse> {
      const mappedResponse: IPaymentResult<IRequestTypeResponse> = {
        status: request.resultStatus || this.resolvePaymentStatus(response),
        data: response,
      };

      if(mappedResponse.status === PaymentStatus.ERROR){
        mappedResponse.error = {
          code: Number(response.errorcode),
          message: response.errormessage,
        }
      }

      return mappedResponse;
  }

  private resolvePaymentStatus(response: IRequestTypeResponse): PaymentStatus {
    if (Number(response.errorcode) !== 0) {
      return PaymentStatus.ERROR;
    }

    if (response.isCancelled) {
      return PaymentStatus.CANCEL;
    }

    return PaymentStatus.SUCCESS;
  }
}
