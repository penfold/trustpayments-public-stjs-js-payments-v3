import { Observable } from 'rxjs';
import { IThreeDInitResponse } from '../../models/IThreeDInitResponse';
import { IStRequest } from '../../models/IStRequest';
import { IThreeDQueryResponse } from '../../models/IThreeDQueryResponse';
import { IRequestTypeResponse } from '../st-codec/interfaces/IRequestTypeResponse';
import { IThreeDLookupResponse } from '../../models/IThreeDLookupResponse';
import { ThreeDLookupRequest } from '../three-d-verification/implementations/trust-payments/data/ThreeDLookupRequest';
import { IApplePayValidateMerchantRequest } from '../../../../integrations/apple-pay/client/models/apple-pay-walletverify-data/IApplePayValidateMerchantRequest';
import { IApplePayWalletVerifyResponseBody } from '../../../../integrations/apple-pay/client/models/apple-pay-walletverify-data/IApplePayWalletVerifyResponseBody';

export abstract class IGatewayClient {
  abstract jsInit(): Observable<IThreeDInitResponse>;
  abstract threedLookup(request: ThreeDLookupRequest): Observable<IThreeDLookupResponse>;
  abstract threedQuery(request: IStRequest, merchantUrl?: string): Observable<IThreeDQueryResponse>;
  abstract auth(request: IStRequest, merchantUrl?: string): Observable<IRequestTypeResponse>;
  abstract walletVerify(request: IApplePayValidateMerchantRequest): Observable<IApplePayWalletVerifyResponseBody>;
}
