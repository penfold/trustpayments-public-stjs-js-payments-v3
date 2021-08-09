import { Observable, of, throwError } from 'rxjs';
import { Service } from 'typedi';
import { IPaymentMethod } from '../../../application/core/services/payments/IPaymentMethod';
import { IPaymentResult } from '../../../application/core/services/payments/IPaymentResult';
import { PaymentMethodToken } from '../../../application/dependency-injection/InjectionTokens';
import { GooglePaymentMethodName } from '../models/IGooglePaymentMethod';
import { catchError, map, mapTo, switchMap } from 'rxjs/operators';
import { IGooglePayGatewayRequest } from '../models/IGooglePayRequest';
import { IRequestTypeResponse } from '../../../application/core/services/st-codec/interfaces/IRequestTypeResponse';
import { PaymentStatus } from '../../../application/core/services/payments/PaymentStatus';
import { GooglePayConfigName, IGooglePayConfig } from '../models/IGooglePayConfig';
import { IRequestProcessingService } from '../../../application/core/services/request-processor/IRequestProcessingService';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { RequestProcessingInitializer } from '../../../application/core/services/request-processor/RequestProcessingInitializer';

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
      map(response => ({
        status: data.resultStatus || this.resolvePaymentStatus(response),
        data: response,
      })),
      catchError(responseOrError => {
        if (!responseOrError.requesttypedescription) {
          return throwError(responseOrError);
        }

        return of({
          status: data.resultStatus || this.resolvePaymentStatus(responseOrError),
          data: responseOrError,
        });
      }),
    );
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
