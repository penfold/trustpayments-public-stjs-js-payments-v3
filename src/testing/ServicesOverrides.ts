import { Container } from 'typedi';
import { ApplePay } from '../application/core/integrations/apple-pay/ApplePay';
import { ApplePayMock } from '../application/core/integrations/apple-pay/ApplePayMock';
import { Cybertonica } from '../application/core/integrations/cybertonica/Cybertonica';
import { VisaCheckoutMockClass } from '../application/core/integrations/visa-checkout/visa-checkout-mock-class/VisaCheckoutMockClass';
import { VisaCheckout } from '../application/core/integrations/visa-checkout/VisaCheckout';
import { CybertonicaMock } from './mocks/CybertonicaMock';
import { environment } from '../environments/environment';
import { CardinalProvider } from '../application/core/integrations/cardinal-commerce/CardinalProvider';
import { MockCardinalProvider } from './mocks/MockCardinalProvider';

if (environment.testEnvironment) {
  Container.set({ id: Cybertonica, type: CybertonicaMock });
  Container.set({ id: CardinalProvider, type: MockCardinalProvider });
  Container.set({ id: VisaCheckout, type: VisaCheckoutMockClass });
  Container.set({ id: ApplePay, type: ApplePayMock });
}
