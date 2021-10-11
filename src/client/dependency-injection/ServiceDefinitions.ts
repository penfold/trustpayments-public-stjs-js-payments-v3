import HttpClient from '@trustpayments/http-client';
import { Container } from 'typedi';
import { environment } from '../../environments/environment';
import { ConfigProvider } from '../../shared/services/config-provider/ConfigProvider';
import { ConfigService } from '../../shared/services/config-service/ConfigService';
import { GooglePayInitializeSubscriber } from '../integrations/google-pay/google-pay-initialize-subscriber/GooglePayInitializeSubscriber';
import { GooglePaySdkProvider } from '../integrations/google-pay/google-pay-sdk-provider/GooglePaySdkProvider';
import { IGooglePaySdkProvider } from '../integrations/google-pay/google-pay-sdk-provider/IGooglePaySdkProvider';
import { PreventNavigationPopup } from '../message-subscribers/PreventNavigationPopup';
import { PaymentResultSubmitterSubscriber } from '../common-frames/PaymentResultSubmitterSubscriber';
import { ThreeDSecureFactory } from '@trustpayments/3ds-sdk-js';
import '../../shared/dependency-injection/ServiceDefinitions';
import { ApplePayClientInitializer } from '../../integrations/apple-pay/client/ApplePayClientInitializer';
import { IApplePaySessionWrapper } from '../../integrations/apple-pay/client/interfaces/IApplePaySessionWrapper';
import { ApplePaySessionWrapper } from '../../integrations/apple-pay/client/ApplePaySessionWrapper';

Container.set({ id: ConfigProvider, factory: () => Container.get(ConfigService) });
Container.set({ id: ThreeDSecureFactory, type: ThreeDSecureFactory });
Container.set({ id: IGooglePaySdkProvider, type: GooglePaySdkProvider });
Container.set({ id: IApplePaySessionWrapper, type: ApplePaySessionWrapper });
Container.import([
  PreventNavigationPopup,
  PaymentResultSubmitterSubscriber,
  GooglePayInitializeSubscriber,
  ApplePayClientInitializer,
]);

if(environment.testEnvironment){
  Container.set({ id: HttpClient, type: HttpClient });
}
