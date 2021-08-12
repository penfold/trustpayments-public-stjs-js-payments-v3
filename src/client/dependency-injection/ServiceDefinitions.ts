import { Container } from 'typedi';
import { ConfigProvider } from '../../shared/services/config-provider/ConfigProvider';
import { ConfigService } from '../../shared/services/config-service/ConfigService';
import { GooglePayInitializeSubscriber } from '../integrations/google-pay/google-pay-initialize-subscriber/GooglePayInitializeSubscriber';
import { GooglePaySdkProvider } from '../integrations/google-pay/google-pay-sdk-provider/GooglePaySdkProvider';
import { IGooglePaySdkProvider } from '../integrations/google-pay/google-pay-sdk-provider/IGooglePaySdkProvider';
import { PreventNavigationPopup } from '../message-subscribers/PreventNavigationPopup';
import { PaymentResultSubmitterSubscriber } from '../common-frames/PaymentResultSubmitterSubscriber';
import { ThreeDSecureFactory } from '@trustpayments/3ds-sdk-js';
import '../../shared/dependency-injection/ServiceDefinitions';

Container.set({ id: ConfigProvider, factory: () => Container.get(ConfigService) });
Container.set({ id: ThreeDSecureFactory, type: ThreeDSecureFactory });
Container.set({ id: IGooglePaySdkProvider, type: GooglePaySdkProvider });
Container.import([
  PreventNavigationPopup,
  PaymentResultSubmitterSubscriber,
  GooglePayInitializeSubscriber,
]);
