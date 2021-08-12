import HttpClient from '@trustpayments/http-client';
import { Container } from 'typedi';
import { ApplePayButtonService } from '../application/core/integrations/apple-pay/apple-pay-button-service/ApplePayButtonService';
import { ApplePayButtonServiceMock } from '../application/core/integrations/apple-pay/apple-pay-button-service/ApplePayButtonServiceMock';
import { Cybertonica } from '../application/core/integrations/cybertonica/Cybertonica';
import { VisaCheckoutSdkProvider } from '../application/core/integrations/visa-checkout/visa-checkout-sdk-provider/VisaCheckoutSdkProvider';
import { VisaCheckoutSdkProviderMock } from '../application/core/integrations/visa-checkout/visa-checkout-sdk-provider/VisaCheckoutSdkProviderMock';
import { VisaCheckout } from '../application/core/integrations/visa-checkout/VisaCheckout';
import { VisaCheckoutMock } from '../application/core/integrations/visa-checkout/VisaCheckoutMock';
import { GooglePaySdkProviderMock } from '../client/integrations/google-pay/google-pay-sdk-provider/GooglePaySdkProviderMock';
import { IGooglePaySdkProvider } from '../client/integrations/google-pay/google-pay-sdk-provider/IGooglePaySdkProvider';
import { CybertonicaMock } from './mocks/CybertonicaMock';
import { environment } from '../environments/environment';
import { CardinalProvider } from '../client/integrations/cardinal-commerce/CardinalProvider';
import { MockCardinalProvider } from './mocks/MockCardinalProvider';
import { ApplePay } from '../client/integrations/apple-pay/ApplePay';
import { ApplePayMock } from '../client/integrations/apple-pay/ApplePayMock';
import { IApplePaySessionWrapper } from '../client/integrations/apple-pay/apple-pay-session-service/IApplePaySessionWrapper';
import { ApplePaySessionWrapperMock } from '../client/integrations/apple-pay/apple-pay-session-service/ApplePaySessionWrapperMock';
import { IHttpOptionsProvider } from '../application/core/services/st-transport/http-options-provider/IHttpOptionsProvider';
import { TestHttpOptionsProvider } from '../application/core/services/st-transport/http-options-provider/TestHttpOptionsProvider';

if(environment.testEnvironment) {
  Container.set({ id: HttpClient, type: HttpClient });
  Container.set({ id: Cybertonica, type: CybertonicaMock });
  Container.set({ id: CardinalProvider, type: MockCardinalProvider });
  Container.set({ id: VisaCheckout, type: VisaCheckoutMock });
  Container.set({ id: VisaCheckoutSdkProvider, type: VisaCheckoutSdkProviderMock });
  Container.set({ id: ApplePay, type: ApplePayMock });
  Container.set({ id: ApplePayButtonService, type: ApplePayButtonServiceMock });
  Container.set({ id: IGooglePaySdkProvider, type: GooglePaySdkProviderMock });
  Container.set({ id: IApplePaySessionWrapper, type: ApplePaySessionWrapperMock });
  Container.set({ id: IHttpOptionsProvider, type: TestHttpOptionsProvider });
}
