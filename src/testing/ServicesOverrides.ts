import { Container } from 'typedi';
import { Cybertonica } from '../application/core/integrations/cybertonica/Cybertonica';
import { VisaCheckoutSdkProvider } from '../application/core/integrations/visa-checkout/visa-checkout-sdk-provider/VisaCheckoutSdkProvider';
import { VisaCheckoutSdkProviderMock } from '../application/core/integrations/visa-checkout/visa-checkout-sdk-provider/VisaCheckoutSdkProviderMock';
import { VisaCheckout } from '../application/core/integrations/visa-checkout/VisaCheckout';
import { VisaCheckoutMock } from '../application/core/integrations/visa-checkout/VisaCheckoutMock';
import { CybertonicaMock } from './mocks/CybertonicaMock';
import { environment } from '../environments/environment';
import { CardinalProvider } from '../client/integrations/cardinal-commerce/CardinalProvider';
import { MockCardinalProvider } from './mocks/MockCardinalProvider';

if (environment.testEnvironment) {
  Container.set({ id: Cybertonica, type: CybertonicaMock });
  Container.set({ id: CardinalProvider, type: MockCardinalProvider });
  Container.set({ id: VisaCheckout, type: VisaCheckoutMock });
  Container.set({ id: VisaCheckoutSdkProvider, type: VisaCheckoutSdkProviderMock });
}
