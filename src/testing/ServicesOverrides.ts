import { Container } from 'typedi';
import { Cybertonica } from '../application/core/integrations/cybertonica/Cybertonica';
import { CybertonicaMock } from './mocks/CybertonicaMock';
import { environment } from '../environments/environment';
import { CardinalProvider } from '../application/core/integrations/cardinal-commerce/CardinalProvider';
import { MockCardinalProvider } from './mocks/MockCardinalProvider';
import { ApplePay } from '../application/core/integrations/apple-pay/ApplePay';
import { ApplePayMock } from '../application/core/integrations/apple-pay/ApplePayMock';
import { VisaCheckout } from '../application/core/integrations/visa-checkout/VisaCheckout';
import { VisaCheckoutMock } from '../application/core/integrations/visa-checkout/VisaCheckoutMock';

if (environment.testEnvironment) {
  Container.set({ id: Cybertonica, type: CybertonicaMock });
  Container.set({ id: CardinalProvider, type: MockCardinalProvider });
  Container.set({ id: ApplePay, type: ApplePayMock });
  Container.set({ id: VisaCheckout, type: VisaCheckoutMock });
}
