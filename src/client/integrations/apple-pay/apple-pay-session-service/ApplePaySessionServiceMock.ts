// import { Observable, of } from 'rxjs';
// import { Service } from 'typedi';
// import { IApplePayConfigObject } from '../../../../application/core/integrations/apple-pay/apple-pay-config-service/IApplePayConfigObject';
// import { IApplePayPaymentAuthorizationResult } from '../../../../application/core/integrations/apple-pay/apple-pay-payment-data/IApplePayPaymentAuthorizationResult ';
// import { IApplePayPaymentAuthorizedEvent } from '../../../../application/core/integrations/apple-pay/apple-pay-payment-data/IApplePayPaymentAuthorizedEvent';
// import { IApplePayPaymentMethodSelectedEvent } from '../../../../application/core/integrations/apple-pay/apple-pay-payment-data/IApplePayPaymentMethodSelectedEvent';
// import { IApplePayValidateMerchantEvent } from '../../../../application/core/integrations/apple-pay/apple-pay-walletverify-data/IApplePayValidateMerchantEvent';
// import { ApplePayClientErrorCode } from '../../../../application/core/integrations/apple-pay/ApplePayClientErrorCode';
// import { ApplePayClientStatus } from '../../../../application/core/integrations/apple-pay/ApplePayClientStatus';
// import { IApplePayClientStatus } from '../../../../application/core/integrations/apple-pay/IApplePayClientStatus';
// import { PUBLIC_EVENTS } from '../../../../application/core/models/constants/EventTypes';
// import { DomMethods } from '../../../../application/core/shared/dom-methods/DomMethods';
// import { IMessageBus } from '../../../../application/core/shared/message-bus/IMessageBus';
// import { IStore } from '../../../../application/core/store/IStore';
// import { environment } from '../../../../environments/environment';
// // tslint:disable-next-line:max-line-length
// import { IApplePayShippingContactSelectedEvent } from '../apple-pay-shipping-data/IApplePayShippingContactSelectedEvent';
// import { IApplePayShippingMethodSelectedEvent } from '../apple-pay-shipping-data/IApplePayShippingMethodSelectedEvent';
// import { IApplePayPaymentMethodUpdate } from './IApplePayPaymentMethodUpdate';
// import { IApplePaySession } from './IApplePaySession';
// import { IApplePayShippingContactUpdate } from './IApplePayShippingContactUpdate';
// import { IApplePayShippingMethodUpdate } from './IApplePayShippingMethodUpdate';
// import { ApplePaySessionService } from './ApplePaySessionService';
//
// @Service()
// export class ApplePaySessionServiceMock extends ApplePaySessionService {
//   private applePayConfig: IApplePayConfigObject;
//
//   constructor(private messageBus: IMessageBus, private store: IStore<any>) {}
//
//   STATUS_SUCCESS: any = 'SUCCESS';
//   STATUS_FAILURE: any = 'FAILURE';
//
//   readonly STATUS_INVALID_BILLING_POSTAL_ADDRESS: number;
//   readonly STATUS_INVALID_SHIPPING_CONTACT: number;
//   readonly STATUS_INVALID_SHIPPING_POSTAL_ADDRESS: number;
//   readonly STATUS_PIN_INCORRECT: number;
//   readonly STATUS_PIN_LOCKOUT: number;
//   readonly STATUS_PIN_REQUIRED: number;
//
//   init(): void {
//     this.store
//       .select(state => state.applePay.config)
//       .subscribe(applePayConfig => {
//         this.applePayConfig = applePayConfig;
//         this.begin();
//       });
//   }
//
//   begin(): void {
//     fetch(environment.APPLE_PAY_URLS.MOCK_DATA_URL)
//       .then((response: any) => {
//         return response.json();
//       })
//       .then((data: any) => {
//         this.handleResponse(data);
//       });
//   }
//
//   hasApplePaySessionObject(): boolean {
//     return true;
//   }
//
//   canMakePayments(): boolean {
//     return true;
//   }
//
//   getLatestSupportedApplePayVersion(): number {
//     return 6;
//   }
//
//   canMakePaymentsWithActiveCard(merchantId: string): Observable<boolean> {
//     return of(true);
//   }
//
//   // tslint:disable-next-line:no-empty
//   oncancel(event: Event): void {
//     this.messageBus.publish<IApplePayClientStatus>({
//       type: PUBLIC_EVENTS.APPLE_PAY_STATUS,
//       data: {
//         status: ApplePayClientStatus.CANCEL,
//         details: {
//           errorCode: ApplePayClientErrorCode.CANCEL,
//           errorMessage: 'Payment has been cancelled'
//         }
//       }
//     });
//   }
//
//   // tslint:disable-next-line:no-empty
//   onpaymentauthorized(event: IApplePayPaymentAuthorizedEvent): void {
//     this.messageBus.publish<IApplePayClientStatus>({
//       type: PUBLIC_EVENTS.APPLE_PAY_STATUS,
//       data: {
//         status: ApplePayClientStatus.ON_PAYMENT_AUTHORIZED,
//         details: {
//           config: this.applePayConfig,
//           formData: DomMethods.parseForm(this.applePayConfig.formId),
//           errorCode: ApplePayClientErrorCode.ON_PAYMENT_AUTHORIZED,
//           errorMessage: '',
//           payment: event.payment
//         }
//       }
//     });
//   }
//
//   // tslint:disable-next-line:no-empty
//   onpaymentmethodselected(event: IApplePayPaymentMethodSelectedEvent): void {}
//
//   // tslint:disable-next-line:no-empty
//   onshippingcontactselected(event: IApplePayShippingContactSelectedEvent): void {}
//
//   // tslint:disable-next-line:no-empty
//   onshippingmethodselected(event: IApplePayShippingMethodSelectedEvent): void {}
//
//   // tslint:disable-next-line:no-empty
//   onvalidatemerchant(event: IApplePayValidateMerchantEvent): void {}
//
//   // tslint:disable-next-line:no-empty
//   abort(): void {}
//
//   addEventListener(
//     type: string,
//     listener: EventListenerOrEventListenerObject | null,
//     options?: boolean | AddEventListenerOptions
//     // tslint:disable-next-line:no-empty
//   ): void {}
//
//   // tslint:disable-next-line:no-empty
//   completeMerchantValidation(merchantSession: any): void {}
//
//   // tslint:disable-next-line:no-empty
//   completePayment(status: IApplePayPaymentAuthorizationResult): void {}
//
//   // tslint:disable-next-line:no-empty
//   completePaymentMethodSelection(update: IApplePayPaymentMethodUpdate): void {}
//
//   // tslint:disable-next-line:no-empty
//   completeShippingContactSelection(update: IApplePayShippingContactUpdate): void {}
//
//   // tslint:disable-next-line:no-empty
//   completeShippingMethodSelection(update: IApplePayShippingMethodUpdate): void {}
//
//   dispatchEvent(event: Event): boolean {
//     return false;
//   }
//
//   openPaymentSetup(merchantId: string): Promise<boolean> {
//     return Promise.resolve(false);
//   }
//
//   removeEventListener(
//     type: string,
//     callback: EventListenerOrEventListenerObject | null,
//     options?: EventListenerOptions | boolean
//     // tslint:disable-next-line:no-empty
//   ): void {}
//
//   supportsVersion(version: number): boolean {
//     return false;
//   }
//
//   private handleResponse(data: any) {
//     if (data.status === 'SUCCESS') {
//       this.onpaymentauthorized(data);
//     } else {
//       this.oncancel(data);
//     }
//
//     return data;
//   }
// }
