import { ContainerInstance } from 'typedi';
import { HttpClient } from '@trustpayments/http-client';
import { ConfigProvider } from '../../shared/services/config-provider/ConfigProvider';
import { StoreConfigProvider } from '../core/services/store-config-provider/StoreConfigProvider';
import { JwtReducer } from '../core/store/reducers/jwt/JwtReducer';
import { IHttpOptionsProvider } from '../core/services/st-transport/http-options-provider/IHttpOptionsProvider';
import { DefaultHttpOptionsProvider } from '../core/services/st-transport/http-options-provider/DefaultHttpOptionsProvider';
import { GooglePaymentMethod } from '../../integrations/google-pay/application/GooglePaymentMethod';
import { ApplePayPaymentMethod } from '../../integrations/apple-pay/application/ApplePayPaymentMethod';
import { APMPaymentMethod } from '../../integrations/apm/application/APMPaymentMethod';
import { IGatewayClient } from '../core/services/gateway-client/IGatewayClient';
import { StTransportGatewayClient } from '../core/services/gateway-client/StTransportGatewayClient';
import { initializeContainer as initializeContainerShared } from '../../shared/dependency-injection/ServiceDefinitions';
import { ReducerToken } from '../../shared/dependency-injection/InjectionTokens';
import { PaymentMethodToken } from './InjectionTokens';

export const initializeContainer = (container: ContainerInstance) => {
  initializeContainerShared(container);
  container.set({ id: ConfigProvider, type: StoreConfigProvider });
  container.set({ id: IHttpOptionsProvider, type: DefaultHttpOptionsProvider });
  container.set({ id: HttpClient, type: HttpClient });
  container.set({ id: IGatewayClient, type: StTransportGatewayClient });
  container.set({ id: ReducerToken, type: JwtReducer, multiple: true });
  container.set({ id: PaymentMethodToken, type: GooglePaymentMethod, multiple: true });
  container.set({ id: PaymentMethodToken, type: ApplePayPaymentMethod, multiple: true });
  container.set({ id: PaymentMethodToken, type: APMPaymentMethod, multiple: true });
}
