import { Container } from 'typedi';
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
import '../../shared/dependency-injection/ServiceDefinitions';
import { ClickToPayPaymentMethod } from '../../integrations/click-to-pay/application/ClickToPayPaymentMethod';
import { TokenizedCardPaymentMethod } from '../../integrations/tokenized-card/application/TokenizedCardPaymentMethod';

Container.set({ id: ConfigProvider, type: StoreConfigProvider });
Container.set({ id: IHttpOptionsProvider, type: DefaultHttpOptionsProvider });
Container.set({ id: HttpClient, type: HttpClient });
Container.set({ id: IGatewayClient, type: StTransportGatewayClient });
Container.import([
  JwtReducer,
  TokenizedCardPaymentMethod,
  GooglePaymentMethod,
  ApplePayPaymentMethod,
  APMPaymentMethod,
  ClickToPayPaymentMethod,
]);
