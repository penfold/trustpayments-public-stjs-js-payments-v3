export class ApplePayPopupMock {
  private container: HTMLDivElement;
  private authorizePaymentButton: HTMLButtonElement;
  private cancelButton: HTMLButtonElement;
  private cancelFunction: () => void;

  constructor() {
    this.container = document.createElement('div');
    this.authorizePaymentButton = document.createElement('button');
    this.cancelButton = document.createElement('button');
  }

  display(applePaySession): void {    
    this.cancelFunction = () => this.close(applePaySession);

    this.container.setAttribute('style', `
      background-color: #fff;
      border: 2px solid;
      width: 300px;
      height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 900;
    `);
    
    this.authorizePaymentButton.disabled = true;
    this.authorizePaymentButton.textContent = 'Procceed';
    this.authorizePaymentButton.id = 'apple-pay-authorize-payment-button';
    this.cancelButton.textContent = 'Cancel';
    this.cancelButton.id = 'apple-pay-cancel-payment-button';

    this.container.appendChild(this.authorizePaymentButton);
    this.container.appendChild(this.cancelButton);

    this.authorizePaymentButton.addEventListener('click', applePaySession.proceedPayment);
    this.cancelButton.addEventListener('click', () => this.cancelFunction());

    document.body.appendChild(this.container);
  }

  unlockAuthorizePaymentButton(): void {
    this.authorizePaymentButton.disabled = false;
  }

  close(applePaySession): void {    
    this.authorizePaymentButton.removeEventListener('click', applePaySession.proceedPayment);
    this.cancelButton.removeEventListener('click', () => this.cancelFunction());
    
    applePaySession.oncancel();
    
    this.container.remove();
    console.log('Popup has been closed');
  }
}
