import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TokenizedCardPaymentConfigName } from '../../../../../src/integrations/tokenized-card/models/ITokenizedCardPaymentMethod';
import { TokenizedCardPaymentAdapter } from '../../../../../src/integrations/tokenized-card/application/TokenizedCardPaymentAdapter';

declare const SecureTrading: any;

@Injectable({
  providedIn: 'root',
})
export class SecureTradingService {
  private st: any;
  configMap = {
    Components: 'components',
    VisaCheckout: 'visaCheckout',
    ApplePay: 'applePay',
    GooglePay: 'googlePay',
  };

  constructor(private snackBar: MatSnackBar) {
  }

  initStandardPaymentMethods(methodsList: string[], config): void {
    if (!methodsList.length || !config) {
      return;
    }

    this.initSecureTradingInstance(config);

    methodsList.map((methodName: string) => {
      this.initPaymentMethod(config, methodName);
    });

  }

  initPaymentMethod(config, methodName): void {

    const methodConfig = config[this.configMap[methodName]];
    this.st[methodName](methodConfig);  // for example this.st.Components(config.components)
  }

  initTokenizedCardPayment(jwtCard: string, config: any): Promise<TokenizedCardPaymentAdapter> {
    this.initSecureTradingInstance(config);

    return this.st?.TokenizedCardPayment(jwtCard, config[TokenizedCardPaymentConfigName]);

  }

  initSecureTradingInstance(config): void {
    if (this.st) {
      return;
    }

    this.st = SecureTrading(config);
    this.initCallbacks(config);
  }

  updateJWT(newJWT): void {
    if (!newJWT || this.st) {
      return;
    }

    this.st.updateJWT(newJWT);
  }

  private initCallbacks(config): void {
    if (!this.st || !config) {
      return;
    }

    if (!config.successCallback) {
      this.st.on('success', () => {
        this.snackBar.open('Payment completed successfully', 'close', {
          verticalPosition: 'top',
          panelClass: 'success',
        });
      });
    }

    if (!config.errorCallback) {
      this.st.on('error', () => {
        this.snackBar.open('An error occurred', 'close', { verticalPosition: 'top', panelClass: 'error' });
      });
    }

    if (!config.submitCallback) {
      this.st.on('submit', data => {
        console.log(`This is what we have got after submit ${JSON.stringify(data)}`);
      });
    }
  }

}
