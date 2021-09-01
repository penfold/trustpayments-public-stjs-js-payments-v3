import { Observable, of, throwError } from 'rxjs';
import { catchError, map, mapTo, switchMap } from 'rxjs/operators';
import { Service } from 'typedi';
import { IPaymentMethod } from '../../../application/core/services/payments/IPaymentMethod';
import { IPaymentResult } from '../../../application/core/services/payments/IPaymentResult';
import { PaymentMethodToken } from '../../../application/dependency-injection/InjectionTokens';
import { ApplePayPaymentMethodName } from '../models/IApplePayPaymentMethod';
import { IApplePayGatewayRequest } from '../models/IApplePayRequest';
import { IRequestTypeResponse } from '../../../application/core/services/st-codec/interfaces/IRequestTypeResponse';
import { PaymentStatus } from '../../../application/core/services/payments/PaymentStatus';
import { IApplePay2Config } from '../models/IApplePayConfig';
import { IRequestProcessingService } from '../../../application/core/services/request-processor/IRequestProcessingService';
import { RequestProcessingInitializer } from '../../../application/core/services/request-processor/RequestProcessingInitializer';

@Service({ id: PaymentMethodToken, multiple: true })
export class ApplePayPaymentMethod implements IPaymentMethod<IApplePay2Config, IApplePayGatewayRequest, IRequestTypeResponse> {
  private requestProcessingService: Observable<IRequestProcessingService>;

  constructor(
    private requestProcessingInitializer: RequestProcessingInitializer
  ) {}

  getName(): string {
    return ApplePayPaymentMethodName;
  }

  init(): Observable<void> {
    this.requestProcessingService = this.requestProcessingInitializer.initialize();

    return this.requestProcessingService.pipe(mapTo(undefined));
  }

  start(data: IApplePayGatewayRequest): Observable<IPaymentResult<IRequestTypeResponse>> {
    return this.requestProcessingService.pipe(
      switchMap((requestProcessingService: Observable<IRequestProcessingService>) => requestProcessingService.process(data)),
      map((response: any) => ({
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
