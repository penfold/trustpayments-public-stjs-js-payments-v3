import { ConfigInterface } from '3ds-sdk-js';
import { ContainerInstance, Service } from 'typedi';
import { IThreeDSecure3dsMethod } from '../../../../../client/integrations/three-d-secure/IThreeDSecure3dsMethod';
import { CardinalCommerceVerificationService } from '../implementations/CardinalCommerceVerificationService';
import { ThreeDSecureVerificationService } from '../implementations/three-d-secure/ThreeDSecureVerificationService';
import { IThreeDVerificationService } from '../IThreeDVerificationService';
import { ThreeDVerificationProvider } from '../ThreeDVerificationProvider';

@Service()
export class ThreeDVerificationProviderService {
  constructor(
    private container: ContainerInstance,
  ) {}

  getProvider(threeDSecureProvider: ThreeDVerificationProvider): IThreeDVerificationService<ConfigInterface | void, IThreeDSecure3dsMethod | void> {
    // @TODO: remove `threeDSecureProvider` bool check after Gateway release. It's going to be required field.
    if (threeDSecureProvider && threeDSecureProvider === ThreeDVerificationProvider.TP) {
      return this.container.get(ThreeDSecureVerificationService);
    } else {
      return this.container.get(CardinalCommerceVerificationService);
    }
  }
}
