import { IStRequest } from '../../models/IStRequest';
import { StCodec } from '../../services/st-codec/StCodec.class';
import { StTransport } from '../../services/st-transport/StTransport.class';
import { ICard } from '../../models/ICard';
import { IMerchantData } from '../../models/IMerchantData';
import { IWallet } from '../../models/IWallet';
import { IWalletVerify } from '../../models/IWalletVerify';
import { Validation } from '../validation/Validation';
import { Container } from 'typedi';
import { NotificationService } from '../../../../client/notification/NotificationService';
import { Cybertonica } from '../../integrations/cybertonica/Cybertonica';
import { PAYMENT_SUCCESS } from '../../models/constants/Translations';
import { IThreeDQueryResponse } from '../../models/IThreeDQueryResponse';
import { IResponseData } from '../../models/IResponseData';

export class Payment {
  private _cardinalCommerceCacheToken: string;
  private _notification: NotificationService;
  private _stTransport: StTransport;
  private _validation: Validation;
  private _cybertonica: Cybertonica;
  private readonly _walletVerifyRequest: IStRequest;

  constructor() {
    this._notification = Container.get(NotificationService);
    this._cybertonica = Container.get(Cybertonica);
    this._stTransport = Container.get(StTransport);
    this._validation = new Validation();
    this._walletVerifyRequest = {
      requesttypedescriptions: ['WALLETVERIFY']
    };
  }

  public setCardinalCommerceCacheToken(cachetoken: string) {
    this._cardinalCommerceCacheToken = cachetoken;
  }

  public async processPayment(
    requestTypes: string[],
    payment: ICard | IWallet,
    merchantData: IMerchantData,
    responseData?: IResponseData
  ): Promise<object> {
    // there are still request types to process
    if (requestTypes.length > 0) {
      const processPaymentRequestBody: IStRequest = {
        ...merchantData,
        ...payment
      };

      if (responseData) {
        processPaymentRequestBody.cachetoken = responseData.cachetoken;
        processPaymentRequestBody.threedresponse = responseData.threedresponse;
      }

      const cybertonicaTid = await this._cybertonica.getTransactionId();

      if (cybertonicaTid) {
        processPaymentRequestBody.fraudcontroltransactionid = cybertonicaTid;
      }

      return this._stTransport.sendRequest(processPaymentRequestBody);
    }

    if (responseData && responseData.requesttypedescription === 'THREEDQUERY' && responseData.threedresponse) {
      // This should only happen if were processing a 3DS payment with no requests after the THREEDQUERY
      StCodec.publishResponse(responseData, responseData.jwt, responseData.threedresponse);
      this._notification.success(PAYMENT_SUCCESS);
    }

    return Promise.resolve({
      response: responseData || {}
    });
  }

  public walletVerify(walletVerify: IWalletVerify) {
    Object.assign(this._walletVerifyRequest, walletVerify);
    return this._stTransport.sendRequest(this._walletVerifyRequest);
  }
}
