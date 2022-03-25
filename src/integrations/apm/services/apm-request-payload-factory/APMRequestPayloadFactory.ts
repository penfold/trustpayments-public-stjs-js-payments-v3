import { Service } from 'typedi';
import { IAPMGatewayRequest } from '../../models/IAPMRequest';
import { IAPMItemConfig } from '../../models/IAPMItemConfig';

@Service()
export class APMRequestPayloadFactory {
  create(apmConfig: IAPMItemConfig): IAPMGatewayRequest {
    return {
      paymenttypedescription: apmConfig.name,
    };
  }
}
