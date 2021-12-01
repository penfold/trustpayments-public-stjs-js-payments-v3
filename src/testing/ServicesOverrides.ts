import { Container } from 'typedi';
import { Cybertonica } from '../application/core/integrations/cybertonica/Cybertonica';
import { VisaCheckoutSdkProvider } from '../application/core/integrations/visa-checkout/visa-checkout-sdk-provider/VisaCheckoutSdkProvider';
import { VisaCheckoutSdkProviderMock } from '../application/core/integrations/visa-checkout/visa-checkout-sdk-provider/VisaCheckoutSdkProviderMock';
import { VisaCheckout } from '../application/core/integrations/visa-checkout/VisaCheckout';
import { VisaCheckoutMock } from '../application/core/integrations/visa-checkout/VisaCheckoutMock';
import { GooglePaySdkProviderMock } from '../client/integrations/google-pay/google-pay-sdk-provider/GooglePaySdkProviderMock';
import { IGooglePaySdkProvider } from '../client/integrations/google-pay/google-pay-sdk-provider/IGooglePaySdkProvider';
import { environment } from '../environments/environment';
import { CardinalProvider } from '../client/integrations/cardinal-commerce/CardinalProvider';
import { IHttpOptionsProvider } from '../application/core/services/st-transport/http-options-provider/IHttpOptionsProvider';
import { TestHttpOptionsProvider } from '../application/core/services/st-transport/http-options-provider/TestHttpOptionsProvider';
import { SeonFraudControlDataProvider } from '../application/core/integrations/seon/SeonFraudControlDataProvider';
import { SeonFraudControlDataProviderMock } from '../application/core/integrations/seon/SeonFraudControlDataProviderMock';
import { ApplePaySessionWrapperMock } from '../integrations/apple-pay/client/mock/ApplePaySessionWrapperMock';
import { IApplePaySessionWrapper } from '../integrations/apple-pay/client/models/IApplePaySessionWrapper';
import { MockCardinalProvider } from './mocks/MockCardinalProvider';
import { CybertonicaMock } from './mocks/CybertonicaMock';

if(environment.testEnvironment) {
  Container.set({ id: Cybertonica, type: CybertonicaMock });
  Container.set({ id: CardinalProvider, type: MockCardinalProvider });
  Container.set({ id: VisaCheckout, type: VisaCheckoutMock });
  Container.set({ id: VisaCheckoutSdkProvider, type: VisaCheckoutSdkProviderMock });
  Container.set({ id: IGooglePaySdkProvider, type: GooglePaySdkProviderMock });
  Container.set({ id: IApplePaySessionWrapper, type: ApplePaySessionWrapperMock });
  Container.set({ id: IHttpOptionsProvider, type: TestHttpOptionsProvider });
  Container.set({ id: SeonFraudControlDataProvider, type: SeonFraudControlDataProviderMock });
}
