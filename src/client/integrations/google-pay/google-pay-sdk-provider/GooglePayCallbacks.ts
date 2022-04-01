import { Observable, map } from 'rxjs';
import { Service } from 'typedi';
import { DomMethods } from '../../../../application/core/shared/dom-methods/DomMethods';
import { GoogleDynamicPriceUpdates, INewShippingOptionParameters, IntermediatePaymentData } from '../../../../integrations/google-pay/models/IGooglePayDynamicPriceUpdates';
import { IPaymentData } from '../../../../integrations/google-pay/models/IGooglePayPaymentRequest';
import { IConfig } from '../../../../shared/model/config/IConfig';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { GooglePayPaymentService } from '../GooglePayPaymentService';

@Service()
export class GooglePayCallbacks {
  constructor (private configProvider: ConfigProvider, private googlePayPaymentService: GooglePayPaymentService) {}

  getCallbacks(): Observable<any> {
    return this.configProvider.getConfig$().pipe(
      map((config: IConfig) => ({
        onPaymentAuthorized: this.onPaymentAuthorized(config),
        onPaymentDataChanged: this.onPaymentDataChanged(config),
      })
    ));
  }

  onPaymentAuthorized(config: IConfig) {
    return (paymentData: IPaymentData) => {
      const formData = DomMethods.parseForm(config.formId);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { shippingAddress, shippingOptionData, ...newPaymentData } = paymentData;
      return this.googlePayPaymentService.processPayment(formData, newPaymentData);
    }
  }

  onPaymentDataChanged(config: IConfig) {
    const { defaultSelectedOptionId, shippingOptions } = config.googlePay.paymentRequest.shippingOptionParameters;
    const displayItems = [...config.googlePay.paymentRequest.transactionInfo.displayItems];

    return (intermediatePaymentData: IntermediatePaymentData) => {
      return new Promise(function(resolve) {
        // let shippingOptionData = intermediatePaymentData.shippingOptionData;
        const paymentDataRequestUpdate: INewShippingOptionParameters = {};

        if (intermediatePaymentData.callbackTrigger === GoogleDynamicPriceUpdates.INITIALIZE || intermediatePaymentData.callbackTrigger === GoogleDynamicPriceUpdates.SHIPPING_ADDRESS) {
          paymentDataRequestUpdate.newShippingOptionParameters = { defaultSelectedOptionId, shippingOptions };
          // let selectedShippingOptionId = (paymentDataRequestUpdate as any).newShippingOptionParameters.defaultSelectedOptionId;
          const newTransactionInfo = config.googlePay.paymentRequest.transactionInfo;
          let totalPrice = 0.00;
          newTransactionInfo.displayItems = [...displayItems, {
            type: 'LINE_ITEM',
            label: 'Shipping cost',
            price: '1.00',
            status: 'FINAL',
          }];
          newTransactionInfo.displayItems.forEach(displayItem => totalPrice += parseFloat(displayItem.price));
          newTransactionInfo.totalPrice = totalPrice.toString();
          paymentDataRequestUpdate.newTransactionInfo = newTransactionInfo;
        } else if (intermediatePaymentData.callbackTrigger === GoogleDynamicPriceUpdates.SHIPPING_OPTION) {
          const newTransactionInfo = config.googlePay.paymentRequest.transactionInfo;
          let totalPrice = 0.00;
          newTransactionInfo.displayItems = [...displayItems, {
            type: 'LINE_ITEM',
            label: 'Shipping cost',
            price: '1.00',
            status: 'FINAL',
          }];
          newTransactionInfo.displayItems.forEach(displayItem => totalPrice += parseFloat(displayItem.price));
          newTransactionInfo.totalPrice = totalPrice.toString();
          paymentDataRequestUpdate.newTransactionInfo = newTransactionInfo;
        }

        resolve(paymentDataRequestUpdate);
      });
    }
  }
}