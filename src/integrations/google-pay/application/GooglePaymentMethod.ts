import { EMPTY, Observable } from 'rxjs';
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
import { GetPaymentStatus } from '../../../application/core/services/payments/PaymentStatus';
import { IGooglePayConfig } from '../models/IGooglePayConfig';

@Service({ id: PaymentMethodToken, multiple: true })
export class GooglePaymentMethod implements IPaymentMethod<IGooglePayConfig, IGooglePayGatewayRequest, IRequestTypeResponse> {
  constructor(private transportService: TransportService, private configProvider: ConfigProvider) {}

  getName(): string {
    return GooglePaymentMethodName;
  }

  init(): Observable<void> {
    return EMPTY;
  }

  start(data: IGooglePayGatewayRequest): Observable<IPaymentResult<IRequestTypeResponse>> {
    const gatewayUrl = this.configProvider.getConfig().googlePay.merchantUrl;

    return this.transportService.sendRequest(data, gatewayUrl).pipe(
      map((response: IRequestTypeResponse) => ({
        status: data.resultStatus || GetPaymentStatus(response.errorcode),
        data: response,
      })),
    );
  }
}
