import { Container, Service } from 'typedi';
import { Observable, from } from 'rxjs';
import { CustomerOutput } from '../../models/constants/CustomerOutput';
import { PAYMENT_SUCCESS } from '../../models/constants/Translations';
import { RequestType } from '../../../../shared/types/RequestType';
import { ICard } from '../../models/ICard';
import { IMerchantData } from '../../models/IMerchantData';
import { IResponseData } from '../../models/IResponseData';
import { IStRequest } from '../../models/IStRequest';
import { IWallet } from '../../models/IWallet';
import { IWalletVerify } from '../../models/IWalletVerify';
import { Cybertonica } from '../../integrations/cybertonica/Cybertonica';
import { NotificationService } from '../../../../client/notification/NotificationService';
import { StCodec } from '../../services/st-codec/StCodec';
import { StTransport } from '../../services/st-transport/StTransport';
import { Validation } from '../validation/Validation';

@Service()
export class Payment {
  private cybertonica: Cybertonica;
  private notificationService: NotificationService;
  private stTransport: StTransport;
  private validation: Validation;

  constructor() {
    this.cybertonica = Container.get(Cybertonica);
    this.notificationService = Container.get(NotificationService);
    this.stTransport = Container.get(StTransport);
    this.validation = new Validation();
  }

  async processPayment(
    requestTypes: RequestType[],
    payment: ICard | IWallet,
    merchantData: IMerchantData,
    responseData?: IResponseData,
  ): Promise<Record<string, any>> {
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

    if (requestTypes.length) {
      return this.processRequestTypes({ ...merchantData, ...payment }, responseData);
    }

    if (responseData && responseData.requesttypedescription === 'THREEDQUERY' && responseData.threedresponse) {
      return this.publishThreedResponse(responseData);
    }

    return this.publishResponse(responseData);
  }

  walletVerify(walletVerify: IWalletVerify): Observable<Record<string, any>> {
    return from(
      this.stTransport.sendRequest(Object.assign({ requesttypedescriptions: ['WALLETVERIFY'] }, walletVerify)),
    );
  }

  private publishResponse(responseData?: IResponseData): Promise<Record<string, any>> {
    return Promise.resolve({
      response: responseData || {},
    });
  }

  private publishErrorResponse(responseData?: IResponseData): Promise<Record<string, any>> {
    return Promise.reject({
      response: responseData || {},
    });
  }

  private async processRequestTypes(
    requestData: IStRequest,
    responseData?: IResponseData,
  ): Promise<Record<string, any>> {
    const processPaymentRequestBody = { ...requestData };
    const merchantUrl: string = responseData ? responseData.merchantUrl : undefined;


    if (responseData) {
      processPaymentRequestBody.cachetoken = responseData.cachetoken;
      processPaymentRequestBody.threedresponse = responseData.threedresponse;
    }

    const cybertonicaTid = await this.cybertonica.getTransactionId();

    if (cybertonicaTid) {
      processPaymentRequestBody.fraudcontroltransactionid = cybertonicaTid;
    }

    return this.stTransport.sendRequest(processPaymentRequestBody, merchantUrl);
  }

  private publishThreedResponse(responseData: IResponseData): Promise<Record<string, any>> {
    // This should only happen if were processing a 3DS payment with no requests after the THREEDQUERY
    StCodec.publishResponse(responseData, responseData.jwt, responseData.threedresponse);
    this.notificationService.success(PAYMENT_SUCCESS);

    return this.publishResponse(responseData);
  }
}
