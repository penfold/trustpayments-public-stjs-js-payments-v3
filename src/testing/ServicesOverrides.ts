import { Container } from 'typedi';
import { ApplePayButtonService } from '../application/core/integrations/apple-pay/apple-pay-button-service/ApplePayButtonService';
import { ApplePayButtonServiceMock } from '../application/core/integrations/apple-pay/apple-pay-button-service/ApplePayButtonServiceMock';
import { Cybertonica } from '../application/core/integrations/cybertonica/Cybertonica';
import { VisaCheckoutSdkProvider } from '../application/core/integrations/visa-checkout/visa-checkout-sdk-provider/VisaCheckoutSdkProvider';
import { VisaCheckoutSdkProviderMock } from '../application/core/integrations/visa-checkout/visa-checkout-sdk-provider/VisaCheckoutSdkProviderMock';
import { VisaCheckout } from '../application/core/integrations/visa-checkout/VisaCheckout';
import { VisaCheckoutMock } from '../application/core/integrations/visa-checkout/VisaCheckoutMock';
import { ApplePaySessionFactory } from '../client/integrations/apple-pay/apple-pay-session-service/ApplePaySessionFactory';
import { ApplePaySessionFactoryMock } from '../client/integrations/apple-pay/apple-pay-session-service/ApplePaySessionFactoryMock';
import { ApplePaySessionServiceMock } from '../client/integrations/apple-pay/apple-pay-session-service/ApplePaySessionServiceMock';
import { ApplePaySessionService } from '../client/integrations/apple-pay/apple-pay-session-service/ApplePaySessionService';
import { CybertonicaMock } from './mocks/CybertonicaMock';
import { environment } from '../environments/environment';
import { CardinalProvider } from '../client/integrations/cardinal-commerce/CardinalProvider';
import { MockCardinalProvider } from './mocks/MockCardinalProvider';
import { ApplePay } from '../client/integrations/apple-pay/ApplePay';
import { ApplePayMock } from '../client/integrations/apple-pay/ApplePayMock';

if (environment.testEnvironment) {
  Container.set({ id: Cybertonica, type: CybertonicaMock });
  Container.set({ id: CardinalProvider, type: MockCardinalProvider });
  Container.set({ id: VisaCheckout, type: VisaCheckoutMock });
  Container.set({ id: VisaCheckoutSdkProvider, type: VisaCheckoutSdkProviderMock });
  Container.set({ id: ApplePay, type: ApplePayMock });
  Container.set({ id: ApplePaySessionService, type: ApplePaySessionServiceMock });
  Container.set({ id: ApplePayButtonService, type: ApplePayButtonServiceMock });
  Container.set({ id: ApplePaySessionFactory, type: ApplePaySessionFactoryMock });
}

// Container.set({ id: ApplePay, type: ApplePayMock });
// Container.set({ id: ApplePaySessionService, type: ApplePaySessionServiceMock });
// Container.set({ id: ApplePayButtonService, type: ApplePayButtonServiceMock });
// Container.set({ id: ApplePaySessionFactory, type: ApplePaySessionFactoryMock });
