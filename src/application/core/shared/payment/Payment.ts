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
    additionalData?: any,
    lastResponseData?: IResponseData
  ): Promise<object> {
    // there are still request types to process
    if (requestTypes.length > 0) {
      const processPaymentRequestBody = {
        ...additionalData,
        ...merchantData,
        ...payment
      };
      const cybertonicaTid = await this._cybertonica.getTransactionId();

      if (cybertonicaTid) {
        (processPaymentRequestBody as any).fraudcontroltransactionid = cybertonicaTid;
      }

      return this._stTransport.sendRequest(processPaymentRequestBody);
    }

    if (lastResponseData && lastResponseData.requesttypedescription === 'THREEDQUERY') {
      // This should only happen if were processing a 3DS payment with no requests after the THREEDQUERY
      const responseData = {
        ...additionalData,
        validated: true
      };

      StCodec.publishResponse(responseData, lastResponseData.jwt, additionalData.threedresponse);
      this._notification.success(PAYMENT_SUCCESS);
    }

    return Promise.resolve({
      response: {}
    });
  }

  public walletVerify(walletVerify: IWalletVerify) {
    Object.assign(this._walletVerifyRequest, walletVerify);
    return this._stTransport.sendRequest(this._walletVerifyRequest);
  }
}
