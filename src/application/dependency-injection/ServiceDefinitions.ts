import { Container } from 'typedi';
import { ConfigProvider } from '../../shared/services/config-provider/ConfigProvider';
import { StoreConfigProvider } from '../core/services/store-config-provider/StoreConfigProvider';
import { IThreeDVerificationService } from '../core/services/three-d-verification/IThreeDVerificationService';
import { CardinalCommerceVerificationService } from '../core/services/three-d-verification/implementations/CardinalCommerceVerificationService';
import { JwtReducer } from '../core/store/reducers/jwt/JwtReducer';
import { IHttpOptionsProvider } from '../core/services/st-transport/http-options-provider/IHttpOptionsProvider';
import { DefaultHttpOptionsProvider } from '../core/services/st-transport/http-options-provider/DefaultHttpOptionsProvider';
import { HttpClient } from '@trustpayments/http-client';
import { GooglePaymentMethod } from '../../integrations/google-pay/application/GooglePaymentMethod';
import '../../shared/dependency-injection/ServiceDefinitions';

Container.set({ id: ConfigProvider, type: StoreConfigProvider });
Container.set({ id: IThreeDVerificationService, type: CardinalCommerceVerificationService });
Container.set({ id: IHttpOptionsProvider, type: DefaultHttpOptionsProvider });
Container.set({ id: HttpClient, type: HttpClient });
Container.import([JwtReducer, GooglePaymentMethod]);
