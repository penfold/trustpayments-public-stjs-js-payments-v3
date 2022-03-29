import { Observable, map } from 'rxjs';
import { Service } from "typedi";
import { IConfig } from "../../../../shared/model/config/IConfig";
import { ConfigProvider } from "../../../../shared/services/config-provider/ConfigProvider";

@Service()
export class GooglePayCallbacks {
  constructor (private configProvider: ConfigProvider) {}

  getCallbacks(): Observable<any> {
    return this.configProvider.getConfig$().pipe(
      map((config: IConfig) => ({
        onPaymentAuthorized: this.onPaymentAuthorized(config),
        onPaymentDataChanged: this.onPaymentDataChanged(config, this.calculateNewTransactionInfo)
      })
    ))
  }

  private processPayment(paymentData) {
    let attempts = 0;

    return new Promise(function(resolve, reject) {
      setTimeout(function() {
        console.log(paymentData.paymentMethodData.tokenizationData.token);
  
        if (attempts++ % 2 == 0) {
          reject(new Error('Every other attempt fails, next one should succeed'));      
        } else {
          resolve({}); 
        }
      }, 500);
    });
  }

  onPaymentAuthorized(config: IConfig) {
    console.warn(88, config)
    return (paymentData: any) => {
      return new Promise(function(resolve, reject) {
        resolve({transactionState: 'SUCCESS'});
        this.processPayment(paymentData)
          .then(function() {
            resolve({transactionState: 'SUCCESS'});
          })
          .catch(function() {
            resolve({
              transactionState: 'ERROR',
              error: {
                intent: 'PAYMENT_AUTHORIZATION',
                message: 'Insufficient funds',
                reason: 'PAYMENT_DATA_INVALID'
              }
            });
          });
      });
    }
  }

  private calculateNewTransactionInfo(shippingOptionId, intermediatePaymentData) {
    console.warn(1, intermediatePaymentData);
    let newTransactionInfo = intermediatePaymentData.transactionInfo;
  
    let shippingCost = "1.00";
    newTransactionInfo.displayItems.push({
      type: "LINE_ITEM",
      label: "Shipping cost",
      price: shippingCost,
      status: "FINAL"
    });

    console.warn('newTransactionInfo 1', newTransactionInfo);
  
    let totalPrice = 0.00;
    newTransactionInfo.displayItems.forEach(displayItem => totalPrice += parseFloat(displayItem.price));
    newTransactionInfo.totalPrice = totalPrice.toString();

    console.warn('newTransactionInfo 2', newTransactionInfo);
  
    return newTransactionInfo;
  }

  onPaymentDataChanged(config: any, calculateNewTransactionInfo) {
    const { googlePay: { defaultSelectedOptionId, shippingOptions }} = config;
    return (intermediatePaymentData: any) => {
      return new Promise(function(resolve, reject) {
        let shippingOptionData = intermediatePaymentData.shippingOptionData;
        let paymentDataRequestUpdate = {};

        if (intermediatePaymentData.callbackTrigger == "INITIALIZE" || intermediatePaymentData.callbackTrigger == "SHIPPING_ADDRESS") {
          (paymentDataRequestUpdate as any).newShippingOptionParameters = { defaultSelectedOptionId, shippingOptions };
          let selectedShippingOptionId = (paymentDataRequestUpdate as any).newShippingOptionParameters.defaultSelectedOptionId;
          (paymentDataRequestUpdate as any).newTransactionInfo = calculateNewTransactionInfo(selectedShippingOptionId, intermediatePaymentData);
        }
        else if (intermediatePaymentData.callbackTrigger == "SHIPPING_OPTION") {
          (paymentDataRequestUpdate as any).newTransactionInfo = calculateNewTransactionInfo(shippingOptionData.id, intermediatePaymentData);
        }

        resolve(paymentDataRequestUpdate);
      });
    }
  }
}