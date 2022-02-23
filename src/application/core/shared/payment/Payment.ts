import { Service } from 'typedi';
import { Observable, from, firstValueFrom } from 'rxjs';
import { CustomerOutput } from '../../models/constants/CustomerOutput';
import { PAYMENT_SUCCESS } from '../../models/constants/Translations';
import { RequestType } from '../../../../shared/types/RequestType';
import { ICard } from '../../models/ICard';
import { IMerchantData } from '../../models/IMerchantData';
import { IResponseData } from '../../models/IResponseData';
import { IStRequest } from '../../models/IStRequest';
import { IWallet } from '../../models/IWallet';
import { IWalletVerify } from '../../models/IWalletVerify';
import { NotificationService } from '../../../../client/notification/NotificationService';
import { StCodec } from '../../services/st-codec/StCodec';
import { StTransport } from '../../services/st-transport/StTransport';
import { Validation } from '../validation/Validation';
import { FraudControlService } from '../../services/fraud-control/FraudControlService';

@Service()
export class Payment {
  constructor(private stTransport: StTransport,
              private validation: Validation,
              private fraudControlService: FraudControlService,
              private notificationService: NotificationService) {
  }

  async processPayment(
    requestTypes: RequestType[],
    payment: ICard | IWallet,
    merchantData: IMerchantData,
    responseData?: IResponseData,
    merchantUrl?: string
    // @todo(typings) Currently it's hard to find a type for response that comforts all the processPayment consumers.
    // The response typings are not interchangeable, they differ in e.g. customeroutput declarations.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<Record<string, any>> {
    const customerOutput: CustomerOutput | undefined = responseData
      ? responseData.customeroutput
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
      return this.processRequestTypes({ ...merchantData, ...payment }, responseData, merchantUrl);
    }

    if (responseData && responseData.requesttypedescription === 'THREEDQUERY' && (responseData.threedresponse || responseData.pares)) {
      return this.publishThreedResponse(responseData);
    }

    return this.publishResponse(responseData);
  }

  // @todo(typings) Currently it's hard to find a type for response that comforts all the walletVerify consumers.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  walletVerify(walletVerify: IWalletVerify): Observable<Record<string, any>> {
    return from(
      this.stTransport.sendRequest(Object.assign({ requesttypedescriptions: ['WALLETVERIFY'] }, walletVerify)),
    );
  }

  private publishResponse(responseData?: IResponseData): Promise<Record<string, unknown>> {
    return Promise.resolve({
      response: responseData || {},
    });
  }

  private publishErrorResponse(responseData?: IResponseData): Promise<Record<string, unknown>> {
    return Promise.reject({
      response: responseData || {},
    });
  }

  private async processRequestTypes(
    requestData: IStRequest,
    responseData?: IResponseData,
    merchantUrl?: string
  ): Promise<Record<string, unknown>> {
    const processPaymentRequestBody = { ...requestData };

    if(responseData) {
      processPaymentRequestBody.cachetoken = responseData.cachetoken;
      processPaymentRequestBody.threedresponse = responseData.threedresponse;
      processPaymentRequestBody.pares = responseData.pares;
      processPaymentRequestBody.md = responseData.md;
    }

    const fraudControlTid = await firstValueFrom(this.fraudControlService.getTransactionId());

    if(fraudControlTid) {
      processPaymentRequestBody.fraudcontroltransactionid = fraudControlTid;
    }

    return this.stTransport.sendRequest(processPaymentRequestBody, merchantUrl);
  }

  private publishThreedResponse(responseData: IResponseData): Promise<Record<string, unknown>> {
    // This should only happen if were processing a 3DS payment with no requests after the THREEDQUERY
    StCodec.publishResponse(responseData, responseData.jwt);
    this.notificationService.success(PAYMENT_SUCCESS);

    return this.publishResponse(responseData);
  }
}
