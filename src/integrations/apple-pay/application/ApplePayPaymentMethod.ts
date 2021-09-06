import { Observable, of } from 'rxjs';
import { mapTo } from 'rxjs/operators';
import { Service } from 'typedi';
import { IPaymentMethod } from '../../../application/core/services/payments/IPaymentMethod';
import { IPaymentResult } from '../../../application/core/services/payments/IPaymentResult';
import { PaymentMethodToken } from '../../../application/dependency-injection/InjectionTokens';
import { ApplePayPaymentMethodName } from '../models/IApplePayPaymentMethod';
import { IApplePayGatewayRequest } from '../models/IApplePayRequest';
import { IRequestTypeResponse } from '../../../application/core/services/st-codec/interfaces/IRequestTypeResponse';
import { PaymentStatus } from '../../../application/core/services/payments/PaymentStatus';
import { IRequestProcessingService } from '../../../application/core/services/request-processor/IRequestProcessingService';
import { RequestProcessingInitializer } from '../../../application/core/services/request-processor/RequestProcessingInitializer';
import { IApplePayConfig } from '../../../application/core/integrations/apple-pay/IApplePayConfig';

@Service({ id: PaymentMethodToken, multiple: true })
export class ApplePayPaymentMethod implements IPaymentMethod<IApplePayConfig, IApplePayGatewayRequest, IRequestTypeResponse> {
  private requestProcessingService: Observable<IRequestProcessingService>;
  private applePayVerifyService: any;

  constructor(
    private requestProcessingInitializer: RequestProcessingInitializer
  ) {}

  getName(): string {
    return ApplePayPaymentMethodName;
  }

  init(): Observable<void> {
    this.requestProcessingService = this.requestProcessingInitializer.initialize();
    this.onValidateMerchant();
    return this.requestProcessingService.pipe(mapTo(undefined));
  }

  start(): Observable<IPaymentResult<any>> {
    return of({
      status: PaymentStatus.SUCCESS,
    });
  }

  onValidateMerchant(): any {
    this.applePayVerifyService.validateMerchant();
  }
}
