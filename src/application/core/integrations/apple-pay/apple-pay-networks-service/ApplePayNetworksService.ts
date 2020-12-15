import { IApplePaySupportedNetworks } from './IApplePaySupportedNetworks';
import { STAGE_ONE_NETWORKS, STAGE_THREE_NETWORKS, STAGE_TWO_NETWORKS } from './ApplePaySupportedNetworks';

export class ApplePayNetworksService {
  private _getSupportedNetworks(version: number): IApplePaySupportedNetworks[] {
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

  setSupportedNetworks(
    version: number,
    paymentRequestNetworks: IApplePaySupportedNetworks[]
  ): IApplePaySupportedNetworks[] {
    let supportedNetworks: IApplePaySupportedNetworks[] = this._getSupportedNetworks(version);
    return (supportedNetworks = paymentRequestNetworks.filter((item: IApplePaySupportedNetworks) => {
      return supportedNetworks.includes(item);
    }));
  }
}
