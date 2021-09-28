import { Observable, of } from 'rxjs';
import { Service } from 'typedi';
import { IPaymentMethod } from '../../../application/core/services/payments/IPaymentMethod';
import { IPaymentResult } from '../../../application/core/services/payments/IPaymentResult';
import { PaymentMethodToken } from '../../../application/dependency-injection/InjectionTokens';
import { IRequestTypeResponse } from '../../../application/core/services/st-codec/interfaces/IRequestTypeResponse';
import { IRequestProcessingService } from '../../../application/core/services/request-processor/IRequestProcessingService';

import { IConfig } from '../../../shared/model/config/IConfig';
import { APMPaymentMethodName } from '../models/IAPMPaymentMethod';

@Service({ id: PaymentMethodToken, multiple: true })
export class APMPaymentMethod implements IPaymentMethod<IConfig, any, IRequestTypeResponse> {
  private requestProcessingService: Observable<IRequestProcessingService>;

  constructor(
  ) {}

  getName(): string {
    return APMPaymentMethodName;
  }

  init(config: IConfig): Observable<void> {
    return of(null);
  }

  start(config: any): Observable<IPaymentResult<IRequestTypeResponse>> {
    return of(null);
  }

}
