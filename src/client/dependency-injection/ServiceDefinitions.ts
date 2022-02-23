import HttpClient from '@trustpayments/http-client';
import { Container, ContainerInstance } from 'typedi';
import { ThreeDSecureFactory } from '@trustpayments/3ds-sdk-js';
import { environment } from '../../environments/environment';
import { ConfigProvider } from '../../shared/services/config-provider/ConfigProvider';
import { ConfigService } from '../../shared/services/config-service/ConfigService';
import { GooglePayInitializeSubscriber } from '../integrations/google-pay/google-pay-initialize-subscriber/GooglePayInitializeSubscriber';
import { GooglePaySdkProvider } from '../integrations/google-pay/google-pay-sdk-provider/GooglePaySdkProvider';
import { IGooglePaySdkProvider } from '../integrations/google-pay/google-pay-sdk-provider/IGooglePaySdkProvider';
import { PreventNavigationPopup } from '../message-subscribers/PreventNavigationPopup';
import { PaymentResultSubmitterSubscriber } from '../common-frames/PaymentResultSubmitterSubscriber';
import { initializeContainer as initializeContainerShared } from '../../shared/dependency-injection/ServiceDefinitions';
import { ApplePayClientInitializer } from '../../integrations/apple-pay/client/ApplePayClientInitializer';
import { IApplePaySessionWrapper } from '../../integrations/apple-pay/client/models/IApplePaySessionWrapper';
import { ApplePaySessionWrapper } from '../../integrations/apple-pay/client/services/session/ApplePaySessionWrapper';
import { APMClientInitializer } from '../../integrations/apm/client/APMClientInitializer';
import { SentryBreadcrumbsSender } from '../../application/core/services/sentry-breadcrumbs-sender/SentryBreadcrumbsSender';
import { AnalyticsEventSender } from '../../application/core/services/analytics-event-sender/AnalyticsEventSender';

export const initializeContainer = (container: ContainerInstance) => {
  initializeContainerShared(container);
  container.set({ id: ConfigProvider, factory: () => container.get(ConfigService) });
  container.set({ id: ThreeDSecureFactory, type: ThreeDSecureFactory });
  container.set({ id: IGooglePaySdkProvider, type: GooglePaySdkProvider });
  container.set({ id: IApplePaySessionWrapper, type: ApplePaySessionWrapper });

  Container.import([
    PreventNavigationPopup,
    PaymentResultSubmitterSubscriber,
    GooglePayInitializeSubscriber,
    ApplePayClientInitializer,
    APMClientInitializer,
    SentryBreadcrumbsSender,
    AnalyticsEventSender,
  ]);

  if(environment.testEnvironment){
    container.set({ id: HttpClient, type: HttpClient });
  }
}

