import { Observable, EMPTY } from 'rxjs';
import { Service } from 'typedi';
import { IPaymentMethod } from '../../../application/core/services/payments/IPaymentMethod';
import { IPaymentResult } from '../../../application/core/services/payments/IPaymentResult';
import { PaymentMethodToken } from '../../../application/dependency-injection/InjectionTokens';
import { GooglePaymentMethodName } from '../models/IGooglePaymentMethod';
import { TransportService } from '../../../application/core/services/st-transport/TransportService';
import { map } from 'rxjs/operators';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { IGooglePayGatewayRequest } from '../models/IGooglePayRequest';
import { IRequestTypeResponse } from '../../../application/core/services/st-codec/interfaces/IRequestTypeResponse';

@Service({ id: PaymentMethodToken, multiple: true })
export class GooglePaymentMethod implements IPaymentMethod {
  constructor(private transportService: TransportService, private configProvider: ConfigProvider) {}

  getName(): string {
    return GooglePaymentMethodName;
  }

  init(): Observable<void> {
    return EMPTY;
  }

  start(data: IGooglePayGatewayRequest): Observable<IPaymentResult<IRequestTypeResponse>> {
    const gatewayUrl = this.configProvider.getConfig().merchantUrl;

    return this.transportService.sendRequest(data, gatewayUrl).pipe(
      map((response: IRequestTypeResponse) => ({
        status: data.resultStatus,
        data: response
      }))
    );
  }
}
