import HttpClient from '@trustpayments/http-client';
import { Container } from 'typedi';
import { ThreeDSecureFactory } from '@trustpayments/3ds-sdk-js';
import { environment } from '../../environments/environment';
import { ConfigProvider } from '../../shared/services/config-provider/ConfigProvider';
import { ConfigService } from '../../shared/services/config-service/ConfigService';
import { GooglePaySdkProvider } from '../integrations/google-pay/google-pay-sdk-provider/GooglePaySdkProvider';
import { IGooglePaySdkProvider } from '../integrations/google-pay/google-pay-sdk-provider/IGooglePaySdkProvider';
import { PreventNavigationPopup } from '../message-subscribers/PreventNavigationPopup';
import { PaymentResultSubmitterSubscriber } from '../common-frames/PaymentResultSubmitterSubscriber';
import '../../shared/dependency-injection/ServiceDefinitions';
import { ApplePayClientInitializer } from '../../integrations/apple-pay/client/ApplePayClientInitializer';
import { IApplePaySessionWrapper } from '../../integrations/apple-pay/client/models/IApplePaySessionWrapper';
import { ApplePaySessionWrapper } from '../../integrations/apple-pay/client/services/session/ApplePaySessionWrapper';
import { APMClientInitializer } from '../../integrations/apm/client/APMClientInitializer';
import { GooglePayClientInitializer } from '../integrations/google-pay/google-pay-client-initializer/GooglePayClientInitializer';
import { VisaSrcProvider } from '../../integrations/click-to-pay/digital-terminal/src/visa/VisaSrcProvider';
import { SentryBreadcrumbsSender } from '../../application/core/services/sentry-breadcrumbs-sender/SentryBreadcrumbsSender';
import { AnalyticsEventSender } from '../../application/core/services/analytics-event-sender/AnalyticsEventSender';
import { TokenizedCardClientInitializer } from '../../integrations/tokenized-card/client/TokenizedCardClientInitializer';
import { MastercardSrcProvider } from '../../integrations/click-to-pay/digital-terminal/src/mastercard/MastercardSrcProvider';

Container.set({ id: ConfigProvider, factory: () => Container.get(ConfigService) });
Container.set({ id: ThreeDSecureFactory, type: ThreeDSecureFactory });
Container.set({ id: IGooglePaySdkProvider, type: GooglePaySdkProvider });
Container.set({ id: IApplePaySessionWrapper, type: ApplePaySessionWrapper });
Container.import([
  APMClientInitializer,
  AnalyticsEventSender,
  ApplePayClientInitializer,
  ApplePayClientInitializer,
  GooglePayClientInitializer,
  PaymentResultSubmitterSubscriber,
  PaymentResultSubmitterSubscriber,
  PreventNavigationPopup,
  PreventNavigationPopup,
  SentryBreadcrumbsSender,
  TokenizedCardClientInitializer,
]);

if (environment.testEnvironment) {
  Container.set({ id: HttpClient, type: HttpClient });
}

Container.import([VisaSrcProvider, MastercardSrcProvider]);
