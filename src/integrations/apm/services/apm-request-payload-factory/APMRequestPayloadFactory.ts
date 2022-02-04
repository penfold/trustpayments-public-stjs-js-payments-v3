import { Service } from 'typedi';
import { IAPMGatewayRequest } from '../../models/IAPMRequest';
import { IAPMItemConfig } from '../../models/IAPMItemConfig';
import { APMName } from '../../models/APMName';

@Service()
export class APMRequestPayloadFactory {
  create(apmConfig: IAPMItemConfig): IAPMGatewayRequest {
    switch (apmConfig.name) {
      case APMName.ACCOUNT2ACCOUNT:
        return this.account2accountPayloadMapper(apmConfig);
      case APMName.ALIPAY:
        return this.aliPayPayloadMapper(apmConfig);
      case APMName.ZIP:
        return this.zipPayloadMapper(apmConfig);
      default:
        return this.defaultPayloadMapper(apmConfig);
    }
  }

  private zipPayloadMapper(apmConfig: IAPMItemConfig): IAPMGatewayRequest {
    return {
      paymenttypedescription: apmConfig.name,
      returnurl: apmConfig.returnUrl,
    };
  }

  private defaultPayloadMapper(apmConfig: IAPMItemConfig): IAPMGatewayRequest {
    return {
      paymenttypedescription: apmConfig.name,
      successfulurlredirect: apmConfig.successRedirectUrl,
      errorurlredirect: apmConfig.errorRedirectUrl,
    };
  }

  private aliPayPayloadMapper(apmConfig: IAPMItemConfig): IAPMGatewayRequest {
    return {
      paymenttypedescription: apmConfig.name,
      returnurl: apmConfig.returnUrl,
    };
  }

  private account2accountPayloadMapper(apmConfig: IAPMItemConfig): IAPMGatewayRequest {
    return {
      paymenttypedescription: apmConfig.name,
      returnurl: apmConfig.returnUrl,
    };
  }
}
