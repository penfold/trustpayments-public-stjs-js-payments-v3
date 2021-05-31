import { ConfigInterface } from '@trustpayments/3ds-sdk-js';
import { ContainerInstance, Service } from 'typedi';
import { CardinalCommerceVerificationService } from './implementations/cardinal-commerce/CardinalCommerceVerificationService';
import { ThreeDSecureVerificationService } from './implementations/trust-payments/ThreeDSecureVerificationService';
import { IThreeDVerificationService } from './IThreeDVerificationService';
import { ThreeDVerificationProviderName } from './data/ThreeDVerificationProviderName';

@Service()
export class ThreeDVerificationProviderService {
  constructor(
    private container: ContainerInstance,
  ) {}

  getProvider(threeDSecureProvider: ThreeDVerificationProviderName): IThreeDVerificationService<ConfigInterface | void> {
    // @TODO: remove `threeDSecureProvider` bool check after Gateway release. It's going to be required field.
    if (threeDSecureProvider && threeDSecureProvider === ThreeDVerificationProviderName.TP) {
      return this.container.get(ThreeDSecureVerificationService);
    } else {
      return this.container.get(CardinalCommerceVerificationService);
    }
  }
}
