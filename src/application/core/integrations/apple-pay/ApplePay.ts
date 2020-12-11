import { Service } from 'typedi';
import { Observable, Subscriber } from 'rxjs';
import { filter, first } from 'rxjs/operators';
import { ofType } from '../../../../shared/services/message-bus/operators/ofType';
import { ApplePayButtonService } from './apple-pay-button-service/ApplePayButtonService';
import { ApplePayConfigService } from './apple-pay-config-service/ApplePayConfigService';
import { DomMethods } from '../../shared/dom-methods/DomMethods';
import { InterFrameCommunicator } from '../../../../shared/services/message-bus/InterFrameCommunicator';
import { Payment } from '../../shared/payment/Payment';
import { ApplePayClientStatus } from '../../../../client/integrations/apple-pay/ApplePayClientStatus';
import { APPLE_PAY_BUTTON_ID } from './apple-pay-button-service/ApplePayButtonProperties';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { MERCHANT_VALIDATION_FAILURE, PAYMENT_ERROR } from '../../models/constants/Translations';
import { IApplePayClientStatus } from '../../../../client/integrations/apple-pay/IApplePayClientStatus';
import { IApplePayPaymentAuthorizationResult } from './IApplePayPaymentAuthorizationResult ';
import { IApplePayPaymentAuthorizedEvent } from './IApplePayPaymentAuthorizedEvent';
import { IApplePayPaymentMethodSelectedEvent } from './IApplePayPaymentMethodSelectedEvent';
import { IApplePayWalletVerifyResponse } from './IApplePayWalletVerifyResponse';
import { IApplePayPaymentRequest } from './IApplePayPaymentRequest';
import { IApplePayProcessPaymentResponse } from './IApplePayProcessPaymentResponse';
import { IApplePayShippingMethodSelectedEvent } from './IApplePayShippingMethodSelectedEvent';
import { IApplePayShippingContactSelectedEvent } from './IApplePayShippingContactSelectedEvent';
import { IApplePayValidateMerchantEvent } from './IApplePayValidateMerchantEvent';
import { IApplePayValidateMerchantRequest } from './IApplePayValidateMerchantRequest';
import { IConfig } from '../../../../shared/model/config/IConfig';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { IApplePayConfig } from './IApplePayConfig';
import { ApplePayErrorCodes } from './apple-pay-error-service/ApplePayErrorCodes';
import { ApplePayErrorService } from './apple-pay-error-service/ApplePayErrorService';
import { Locale } from '../../shared/translator/Locale';

const ApplePaySession = (window as any).ApplePaySession;

@Service()
export class ApplePay {
  private applePaySession: any;
  private validateMerchantRequest: IApplePayValidateMerchantRequest = {
    walletmerchantid: '',
    walletrequestdomain: window.location.hostname,
    walletsource: 'APPLEPAY',
    walletvalidationurl: ''
  };
  private applePayVersion: number;
  private paymentRequest: IApplePayPaymentRequest;
  private formId: string;
  private readonly completion: IApplePayPaymentAuthorizationResult = {
    errors: { code: 'unknown' },
    status: undefined
  };
  private paymentCancelled: boolean = false;
  private locale: Locale;

  constructor(
    private communicator: InterFrameCommunicator,
    private messageBus: IMessageBus,
    private applePayButtonService: ApplePayButtonService,
    private applePayConfigService: ApplePayConfigService,
    private applePayErrorService: ApplePayErrorService
  ) {}

  private proceedPayment(observer: Subscriber<IApplePayClientStatus>): void {
    this.paymentCancelled = false;
    this.applePaySession = new ApplePaySession(this.applePayVersion, this.paymentRequest);
    this.onValidateMerchant(observer);
    this.onPaymentMethodSelected();
    this.onShippingMethodSelected();
    this.onShippingContactSelected();
    this.onPaymentAuthorized(observer);
    this.onCancel(observer);
    this.beginMerchantValidation();
  }

  private onValidateMerchant(observer: Subscriber<IApplePayClientStatus>) {
    this.applePaySession.onvalidatemerchant = (event: IApplePayValidateMerchantEvent) => {
      this.validateMerchantRequest = this.applePayConfigService.updateWalletValidationUrl(
        this.validateMerchantRequest,
        event.validationURL
      );

      const payment = new Payment();

      return payment
        .walletVerify(this.validateMerchantRequest)
        .then((response: IApplePayWalletVerifyResponse) => {
          const { requestid, walletsession } = response.response;

          if (this.paymentCancelled) {
            return Promise.reject(requestid);
          }

          if (!walletsession) {
            return Promise.reject(requestid);
          }

          return new Promise((resolve, reject) => {
            try {
              this.applePaySession.completeMerchantValidation(JSON.parse(walletsession));
              resolve(requestid);
            } catch {
              this.endMerchantValidation();
              observer.next({
                status: ApplePayClientStatus.VALIDATE_MERCHANT_ERROR,
                data: {
                  errorcode: ApplePayErrorCodes.VALIDATE_MERCHANT_ERROR,
                  errormessage: MERCHANT_VALIDATION_FAILURE
                }
              });
              reject(requestid);
            }
          });
        })
        .catch(error => {
          if (this.paymentCancelled) {
            return;
          }
          const { errorcode, errormessage } = error;
          this.endMerchantValidation();
          this.gestureHandler(observer);
          observer.next({
            status: ApplePayClientStatus.VALIDATE_MERCHANT_ERROR,
            data: { errorcode, errormessage }
          });
        });
    };
  }

  private onPaymentAuthorized(observer: Subscriber<IApplePayClientStatus>): void {
    const payment = new Payment();
    this.completeFailedTransaction();
    this.applePaySession.onpaymentauthorized = (event: IApplePayPaymentAuthorizedEvent) => {
      return payment
        .processPayment(
          this.paymentRequest.requestTypes,
          {
            walletsource: this.validateMerchantRequest.walletsource,
            wallettoken: JSON.stringify(event.payment)
          },
          {
            ...DomMethods.parseForm(this.formId),
            termurl: 'https://termurl.com'
          },
          {
            billingContact: event.payment.billingContact,
            shippingContact: event.payment.shippingContact
          }
        )
        .then((response: IApplePayProcessPaymentResponse) => {
          const {
            response: { errorcode, errormessage }
          } = response;
          this.handlePaymentProcessResponse(observer, errorcode, errormessage);
          this.applePaySession.completePayment(this.completion);
          this.gestureHandler(observer);
        })
        .catch(e => {
          this.applePaySession.completePayment(this.completion);
          this.gestureHandler(observer);
          observer.next({
            status: ApplePayClientStatus.ERROR,
            data: { errorcode: ApplePayErrorCodes.ERROR, errormessage: PAYMENT_ERROR }
          });
        });
    };
  }

  private handlePaymentProcessResponse(
    observer: Subscriber<IApplePayClientStatus>,
    errorcode: string,
    errormessage: string
  ): IApplePayPaymentAuthorizationResult {
    if (Number(errorcode) === ApplePayErrorCodes.SUCCESS) {
      this.completion.status = ApplePaySession.STATUS_SUCCESS;
      observer.next({
        status: ApplePayClientStatus.SUCCESS,
        data: { errorcode: ApplePayErrorCodes.SUCCESS, errormessage }
      });

      return this.completion;
    }
    this.completion.errors = this.applePayErrorService.create('unknown', this.locale);
    this.completion.status = ApplePaySession.STATUS_FAILURE;

    observer.next({
      status: ApplePayClientStatus.ERROR,
      data: { errorcode: ApplePayErrorCodes.ERROR, errormessage }
    });

    return this.completion;
  }

  private completeFailedTransaction(): void {
    this.messageBus
      .pipe(
        ofType(PUBLIC_EVENTS.TRANSACTION_COMPLETE),
        filter(event => event.data.requesttypedescription !== 'WALLETVERIFY'),
        first()
      )
      .subscribe(event => {
        if (Number(event.data.errorcode) !== 0) {
          this.applePaySession.completePayment({
            status: ApplePaySession.STATUS_FAILURE,
            errors: this.applePayErrorService.create(event.data.errormessage, this.locale)
          });
        }
      });
  }

  private setValidateMerchantRequest(applePay: IApplePayConfig): IApplePayValidateMerchantRequest {
    return this.applePayConfigService.updateWalletMerchantId(this.validateMerchantRequest, applePay.merchantId);
  }

  private setPaymentRequest(applePay: IApplePayConfig, jwt: string) {
    const { currencyiso3a, mainamount } = this.applePayConfigService.getStJwtData(jwt);

    return this.applePayConfigService.updatePaymentRequest(
      applePay,
      jwt,
      currencyiso3a,
      mainamount,
      this.applePayVersion
    );
  }

  private getLatestSupportedApplePayVersion(): number {
    const versions: number[] = Array.from(Array(7).keys()).slice(1).reverse();
    return versions.find((version: number) => {
      return ApplePaySession.supportsVersion(version);
    });
  }

  private onPaymentMethodSelected(): void {
    this.applePaySession.onpaymentmethodselected = (event: IApplePayPaymentMethodSelectedEvent) => {
      this.applePaySession.completePaymentMethodSelection({
        newTotal: {
          amount: this.paymentRequest.total.amount,
          label: this.paymentRequest.total.label,
          type: 'final'
        }
      });
    };
  }

  private onShippingMethodSelected(): void {
    this.applePaySession.onshippingmethodselected = (event: IApplePayShippingMethodSelectedEvent) => {
      this.applePaySession.completeShippingMethodSelection({
        newTotal: {
          amount: this.paymentRequest.total.amount,
          label: this.paymentRequest.total.label,
          type: 'final'
        }
      });
    };
  }

  private onShippingContactSelected(): void {
    this.applePaySession.onshippingcontactselected = (event: IApplePayShippingContactSelectedEvent) => {
      this.applePaySession.completeShippingContactSelection({
        newTotal: {
          amount: this.paymentRequest.total.amount,
          label: this.paymentRequest.total.label,
          type: 'final'
        }
      });
    };
  }

  private gestureHandler(observer: Subscriber<IApplePayClientStatus>): void {
    const button = document.getElementById(APPLE_PAY_BUTTON_ID);
    const handler = () => {
      this.proceedPayment(observer);
      button.removeEventListener('click', handler);
    };
    if (button) {
      button.addEventListener('click', handler);
    }
  }

  private beginMerchantValidation(): void {
    try {
      this.applePaySession.begin();
    } catch (error) {
      console.warn(error);
    }
  }

  private endMerchantValidation(): void {
    try {
      this.applePaySession.abort();
    } catch (error) {
      console.warn(error);
    }
  }

  private canMakePaymentsWithActiveCard(observer: Subscriber<IApplePayClientStatus>, merchantId: string): boolean {
    const canMakePaymentsWithActiveCard: boolean = ApplePaySession.canMakePaymentsWithActiveCard(merchantId).then(
      (canMakePayments: boolean) => canMakePayments
    );

    observer.next({
      status: ApplePayClientStatus.CAN_MAKE_PAYMENTS_WITH_ACTIVE_CARD,
      data: {
        errorcode: ApplePayErrorCodes.CAN_MAKE_PAYMENT_WITH_ACTIVE_CARD,
        errormessage: `Can make payment with active card: ${canMakePaymentsWithActiveCard}`
      }
    });
    if (!canMakePaymentsWithActiveCard) {
      console.error('User has not an active card provisioned into Wallet');
    }

    return canMakePaymentsWithActiveCard;
  }

  private onCancel(observer: Subscriber<IApplePayClientStatus>): void {
    this.applePaySession.oncancel = (event: Event) => {
      this.gestureHandler(observer);
      observer.next({
        status: ApplePayClientStatus.CANCEL,
        data: { errorcode: ApplePayErrorCodes.CANCEL, errormessage: 'Payment has been cancelled' }
      });
      this.paymentCancelled = true;
    };
  }

  init(): void {
    this.communicator.whenReceive(PUBLIC_EVENTS.APPLE_PAY_START).thenRespond((event: IMessageBusEvent<IConfig>) => {
      if (!Boolean(ApplePaySession)) {
        console.error('Works only on Safari');
      }

      if (!ApplePaySession.canMakePayments()) {
        console.error('Your device does not support making payments with Apple Pay');
      }

      const { data } = event;
      const { applePay, jwt } = this.applePayConfigService.getConfigData(data);
      this.locale = this.applePayConfigService.getStJwtData(jwt).locale;
      this.formId = this.applePayConfigService.getConfigData(data).formId;
      this.applePayVersion = this.getLatestSupportedApplePayVersion();
      this.validateMerchantRequest = this.setValidateMerchantRequest(applePay);
      this.paymentRequest = this.setPaymentRequest(applePay, jwt);

      return new Observable<IApplePayClientStatus>((observer: Subscriber<IApplePayClientStatus>) => {
        if (this.canMakePaymentsWithActiveCard(observer, applePay.merchantId)) {
          this.applePayButtonService.insertButton(
            APPLE_PAY_BUTTON_ID,
            event.data.applePay.buttonText,
            event.data.applePay.buttonStyle,
            event.data.applePay.paymentRequest.countryCode
          );
          this.gestureHandler(observer);
        }
      });
    });
  }
}
