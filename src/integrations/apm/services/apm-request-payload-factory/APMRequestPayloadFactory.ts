import { Service } from 'typedi';
import { IAPMGatewayRequest } from '../../models/IAPMRequest';
import { IAPMItemConfig } from '../../models/IAPMItemConfig';

@Service()
export class APMRequestPayloadFactory {
  create(apmConfig: IAPMItemConfig): IAPMGatewayRequest {
    switch (apmConfig.name) {
      default:
        return this.defaultPayloadMapper(apmConfig);
    }
  }

  private defaultPayloadMapper(apmConfig: IAPMItemConfig): IAPMGatewayRequest {
    return {
      paymenttypedescription: apmConfig.name,
      successfulurlredirect: apmConfig.successRedirectUrl,
      errorurlredirect: apmConfig.errorRedirectUrl,
    };
  }
}
