import { Service } from 'typedi';
import { environment } from '../../../environments/environment';
import { DomMethods } from '../../../application/core/shared/dom-methods/DomMethods';

const GooglePaySession = (window as any).GooglePaySession;

@Service()
export class GooglePay {
  private static readonly SCRIPT_ADDRESS = environment.GOOGLE_PAY.GOOGLE_PAY_URL;
  private DOM_TARGET: string = 'st-google-pay';
  private static SCRIPT_TARGET: string = 'head';
  private googlePlayClient: any;
  private baseRequest: any = {
    apiVersion: 2,
    apiVersionMinor: 0
  };
  private tokenizationSpecification: any = {
    type: 'PAYMENT_GATEWAY',
    parameters: {
      gateway: 'example',
      gatewayMerchantId: 'exampleGatewayMerchantId'
    }
  };
  private allowedCardNetworks = ['AMEX', 'DISCOVER', 'INTERAC', 'JCB', 'MASTERCARD', 'VISA'];
  private allowedCardAuthMethods = ['PAN_ONLY', 'CRYPTOGRAM_3DS'];
  private baseCardPaymentMethod = {
    type: 'CARD',
    parameters: {
      allowedAuthMethods: this.allowedCardAuthMethods,
      allowedCardNetworks: this.allowedCardNetworks
    }
  };
  private isReadyToPayRequest = Object.assign({}, this.baseRequest);

  constructor() {
    this.isReadyToPayRequest.allowedPaymentMethods = [this.baseCardPaymentMethod];
    this.onInit();
  }

  private onInit() {
    this.insertGooglePayLibrary().then(() => {
      this.googlePlayClient = new (window as any).google.payments.api.PaymentsClient({ environment: 'TEST' });
      this.ifGooglePayIsAvailable();
    });
  }

  private insertGooglePayLibrary(): Promise<Element> {
    return DomMethods.insertScript(GooglePay.SCRIPT_TARGET, { src: GooglePay.SCRIPT_ADDRESS });
  }

  protected ifGooglePayIsAvailable(): any {
    this.googlePlayClient
      .isReadyToPay(this.isReadyToPayRequest)
      .then((response: any) => {
        if (response.result) {
          const button = this.googlePlayClient.createButton({ onClick: () => console.log('Start płatności') });
          document.getElementById(this.DOM_TARGET).appendChild(button);
          return true;
        }
      })
      .catch((err: any) => {
        // show error in developer console for debugging
        console.log('nie działa');
        console.error(err);
        return true;
      });
  }
}
