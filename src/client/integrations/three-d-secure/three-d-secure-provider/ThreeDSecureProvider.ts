import { ThreeDSecureInterface, ThreeDSecureFactory } from '3ds-sdk-js';
import { Service } from 'typedi';

@Service()
export class ThreeDSecureProvider {
  getSdk(): ThreeDSecureInterface {
    const threeDSecureFactory = new ThreeDSecureFactory();

    return threeDSecureFactory.create();
  }
}
