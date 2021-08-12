import { Service } from 'typedi';
import { IApplePaySupportedNetworks } from './IApplePaySupportedNetworks';
import { STAGE_ONE_NETWORKS, STAGE_THREE_NETWORKS, STAGE_TWO_NETWORKS } from './ApplePaySupportedNetworks';

@Service()
export class ApplePayNetworksService {
  setSupportedNetworks(
    version: number,
    paymentRequestNetworks: IApplePaySupportedNetworks[],
  ): IApplePaySupportedNetworks[] {

    if (!paymentRequestNetworks.length) {
      return [
        'amex',
        'chinaUnionPay',
        'discover',
        'interac',
        'jcb',
        'masterCard',
        'privateLabel',
        'visa',
      ];
    }

    let supportedNetworks: IApplePaySupportedNetworks[] = this.getSupportedNetworks(version);

    return (supportedNetworks = paymentRequestNetworks.filter((item: IApplePaySupportedNetworks) => {
      return supportedNetworks.includes(item);
    }));
  }

  private getSupportedNetworks(version: number): IApplePaySupportedNetworks[] {
    const stageOneVersions: number[] = [1, 2, 3];
    const stageTwoVersions: number[] = [4];
    const stageThreeVersions: number[] = [5, 6];

    if (stageOneVersions.includes(version)) {
      return STAGE_ONE_NETWORKS;
    }

    if (stageTwoVersions.includes(version)) {
      return STAGE_TWO_NETWORKS;
    }

    if (stageThreeVersions.includes(version)) {
      return STAGE_THREE_NETWORKS;
    }
  }
}
