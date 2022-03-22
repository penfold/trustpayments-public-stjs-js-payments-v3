import { Service } from "typedi";
import { ConfigProvider } from "../../../../shared/services/config-provider/ConfigProvider";

@Service()
export class GooglePayCallbacks {
  private config;

  constructor (private configProvider: ConfigProvider) {}

  init() {
    this.config = this.configProvider.getConfig()
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

  onPaymentAuthorized(paymentData) {
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

  private calculateNewTransactionInfo(shippingOptionId, intermediatePaymentData) {
    console.warn(shippingOptionId);
    let newTransactionInfo = intermediatePaymentData.transactionInfo;
  
    let shippingCost = "1.00";
    newTransactionInfo.displayItems.push({
      type: "LINE_ITEM",
      label: "Shipping cost",
      price: shippingCost,
      status: "FINAL"
    });
  
    let totalPrice = 0.00;
    newTransactionInfo.displayItems.forEach(displayItem => totalPrice += parseFloat(displayItem.price));
    newTransactionInfo.totalPrice = totalPrice.toString();
  
    return newTransactionInfo;
  }

  onPaymentDataChanged(intermediatePaymentData) {
    console.log(this.config);
    return new Promise(function(resolve, reject) {
      // const transactionInfo = ;
      const shippingOptionData = intermediatePaymentData.shippingOptionData;
      const paymentDataRequestUpdate = {};
      let newTransactionInfo = {
        displayItems: [
          {
            label: "Subtotal",
            type: "SUBTOTAL",
            price: "11.00",
          },
          {
            label: "Tax",
            type: "TAX",
            price: "1.00",
          }
        ],
        countryCode: 'US',
        currencyCode: "USD",
        totalPriceStatus: "FINAL",
        totalPrice: "12.00",
        totalPriceLabel: "Total"
      };
      const totalPrice = 0.00;
      // should be in config
      const shipingPrice = {
        "shipping-001": "0.00",
        "shipping-002": "1.99",
        "shipping-003": "1000.00"
      };
  
      if (intermediatePaymentData.callbackTrigger === "INITIALIZE" || intermediatePaymentData.callbackTrigger === "SHIPPING_ADDRESS") {
        (paymentDataRequestUpdate as any).newShippingOptionParameters = this.config.googlePay.shippingOptionParameters;
        let selectedShippingOptionId = (paymentDataRequestUpdate as any).newShippingOptionParameters.defaultSelectedOptionId;
        // newTransactionInfo = intermediatePaymentData.transactionInfo
        // newTransactionInfo.displayItems.push({
        //   type: "LINE_ITEM",
        //   label: "Shipping cost",
        //   price: shipingPrice[selectedShippingOptionId],
        //   status: "FINAL"
        // });
        // newTransactionInfo.displayItems.forEach(displayItem => totalPrice += parseFloat(displayItem.price));
        // newTransactionInfo.totalPrice = totalPrice.toString();
        // (paymentDataRequestUpdate as any).newTransactionInfo = self.calculateNewTransactionInfo(selectedShippingOptionId, intermediatePaymentData);
      } else if (intermediatePaymentData.callbackTrigger === "SHIPPING_OPTION") {
        newTransactionInfo = intermediatePaymentData.transactionInfo;
        console.warn(4, transactionInfo);
        // newTransactionInfo.displayItems.push({
        //   type: "LINE_ITEM",
        //   label: "Shipping cost",
        //   price: shipingPrice[shippingOptionData.id],
        //   status: "FINAL"
        // });
        // newTransactionInfo.displayItems.forEach(displayItem => totalPrice += parseFloat(displayItem.price));
        // newTransactionInfo.totalPrice = totalPrice.toString();
        // (paymentDataRequestUpdate as any).newTransactionInfo = self.calculateNewTransactionInfo(shippingOptionData.id, intermediatePaymentData);
      }
  
      resolve(paymentDataRequestUpdate);
    });
  }
}