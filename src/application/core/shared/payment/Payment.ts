import { IStRequest } from '../../models/IStRequest';
import { StCodec } from '../../services/st-codec/StCodec.class';
import { StTransport } from '../../services/st-transport/StTransport.class';
import { ICard } from '../../models/ICard';
import { IMerchantData } from '../../models/IMerchantData';
import { IWallet } from '../../models/IWallet';
import { IWalletVerify } from '../../models/IWalletVerify';
import { Validation } from '../validation/Validation';
import { Container, Service } from 'typedi';
import { NotificationService } from '../../../../client/notification/NotificationService';
import { Cybertonica } from '../../integrations/cybertonica/Cybertonica';
import { PAYMENT_SUCCESS } from '../../models/constants/Translations';
import { IResponseData } from '../../models/IResponseData';
import { CustomerOutput } from '../../models/constants/CustomerOutput';
import { RequestType } from '../../../../shared/types/RequestType';

@Service()
export class Payment {
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

  public async processPayment(
    requestTypes: RequestType[],
    payment: ICard | IWallet,
    merchantData: IMerchantData,
    responseData?: IResponseData
  ): Promise<object> {
    const customerOutput: CustomerOutput | undefined = responseData
      ? (responseData.customeroutput as CustomerOutput)
      : undefined;

    if (customerOutput === CustomerOutput.RESULT) {
      return this.publishResponse(responseData);
    }

    if (customerOutput === CustomerOutput.TRYAGAIN) {
      return this.publishErrorResponse(responseData);
    }

    if (responseData && Number(responseData.errorcode)) {
      return this.publishErrorResponse(responseData);
    }

    if (requestTypes.length > 0) {
      const requestData: IStRequest = { ...merchantData, ...payment } as IStRequest;

      return this.processRequestTypes(requestData, responseData);
    }

    if (responseData && responseData.requesttypedescription === 'THREEDQUERY' && responseData.threedresponse) {
      return this.publishThreedResponse(responseData);
    }

    return this.publishResponse(responseData);
  }

  public walletVerify(walletVerify: IWalletVerify) {
    Object.assign(this._walletVerifyRequest, walletVerify);
    return this._stTransport.sendRequest(this._walletVerifyRequest);
  }

  private publishResponse(responseData?: IResponseData): Promise<object> {
    return Promise.resolve({
      response: responseData || {}
    });
  }

  private publishErrorResponse(responseData?: IResponseData): Promise<object> {
    return Promise.reject({
      response: responseData || {}
    });
  }

  private async processRequestTypes(requestData: IStRequest, responseData?: IResponseData): Promise<object> {
    const processPaymentRequestBody = { ...requestData };

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

  private publishThreedResponse(responseData: IResponseData): Promise<object> {
    // This should only happen if were processing a 3DS payment with no requests after the THREEDQUERY
    StCodec.publishResponse(responseData, responseData.jwt, responseData.threedresponse);
    this._notification.success(PAYMENT_SUCCESS);

    return this.publishResponse(responseData);
  }
}
