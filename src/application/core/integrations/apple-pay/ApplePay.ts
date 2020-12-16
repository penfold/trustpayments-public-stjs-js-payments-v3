import { Service } from 'typedi';
import { from, of } from 'rxjs';
import { filter, first, map, switchMap, take } from 'rxjs/operators';
import { ofType } from '../../../../shared/services/message-bus/operators/ofType';
import { IApplePayClientStatus } from '../../../../client/integrations/apple-pay/IApplePayClientStatus';
import { IApplePayConfigObject } from './apple-pay-config-service/IApplePayConfigObject';
import { IApplePayPaymentAuthorizationResult } from './apple-pay-payment-data/IApplePayPaymentAuthorizationResult ';
import { IApplePayPaymentAuthorizedEvent } from './apple-pay-payment-data/IApplePayPaymentAuthorizedEvent';
import { IApplePaySession } from './apple-pay-session-service/IApplePaySession';
import { IApplePayValidateMerchantEvent } from './apple-pay-walletverify-data/IApplePayValidateMerchantEvent';
import { IConfig } from '../../../../shared/model/config/IConfig';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { ApplePayClientStatus } from '../../../../client/integrations/apple-pay/ApplePayClientStatus';
import { ApplePayErrorCodes } from './apple-pay-error-service/ApplePayErrorCodes';
import { APPLE_PAY_BUTTON_ID } from './apple-pay-button-service/ApplePayButtonProperties';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { VALIDATION_ERROR } from '../../models/constants/Translations';
import { ApplePayButtonService } from './apple-pay-button-service/ApplePayButtonService';
import { ApplePayConfigService } from './apple-pay-config-service/ApplePayConfigService';
import { ApplePayErrorService } from './apple-pay-error-service/ApplePayErrorService';
import { ApplePayPaymentService } from './apple-pay-payment-service/ApplePayPaymentService';
import { ApplePaySessionFactory } from './apple-pay-session-service/ApplePaySessionFactory';
import { ApplePaySessionService } from './apple-pay-session-service/ApplePaySessionService';
import { InterFrameCommunicator } from '../../../../shared/services/message-bus/InterFrameCommunicator';
import { ApplePayErrorCode } from './apple-pay-error-service/ApplePayErrorCode';

const ApplePaySession = (window as any).ApplePaySession;

@Service()
export class ApplePay {
  private applePaySession: IApplePaySession;
  private readonly completion: IApplePayPaymentAuthorizationResult = {
    errors: undefined,
    status: undefined
  };
  private config: IApplePayConfigObject;
  private paymentCancelled: boolean = false;

  constructor(
    private communicator: InterFrameCommunicator,
    private messageBus: IMessageBus,
    private applePayButtonService: ApplePayButtonService,
    private applePayConfigService: ApplePayConfigService,
    private applePayErrorService: ApplePayErrorService,
    private applePaySessionFactory: ApplePaySessionFactory,
    private applePaySessionService: ApplePaySessionService,
    private applePayPaymentService: ApplePayPaymentService
  ) {}

  init(): void {
    this.messageBus
      .pipe(ofType(PUBLIC_EVENTS.APPLE_PAY_CONFIG))
      .pipe(
        map((event: IMessageBusEvent<IConfig>) => {
          if (!Boolean(ApplePaySession)) {
            console.error('Works only on Safari');
            return { status: false, config: event.data };
          }

          if (!ApplePaySession.canMakePayments()) {
            console.error('Your device does not support making payments with Apple Pay');
            return { status: false, config: event.data };
          }
          return { status: true, config: event.data };
        }),
        filter((initObject: { status: boolean; config: IConfig }) => initObject.status),
        switchMap((initObject: { status: boolean; config: IConfig }) => {
          return from(
            this.applePaySessionService.canMakePaymentsWithActiveCard(initObject.config.applePay.merchantId)
          ).pipe(
            filter((canMakePayment: boolean) => canMakePayment),
            map((canMakePayment: boolean) => {
              if (!canMakePayment) {
                console.error('User has not an active card provisioned into Wallet');
                return of(ApplePayClientStatus.NO_ACTIVE_CARDS_IN_WALLET);
              }

              this.applePayButtonService.insertButton(
                APPLE_PAY_BUTTON_ID,
                initObject.config.applePay.buttonText,
                initObject.config.applePay.buttonStyle,
                initObject.config.applePay.paymentRequest.countryCode
              );
              this.config = this.applePayConfigService.setConfig(initObject.config, {
                walletmerchantid: '',
                walletrequestdomain: window.location.hostname,
                walletsource: 'APPLEPAY',
                walletvalidationurl: ''
              });
              this.gestureHandler();

              return of(ApplePayClientStatus.CAN_MAKE_PAYMENTS_WITH_ACTIVE_CARD);
            }),
            take(1)
          );
        })
      )
      .subscribe();
  }

  private proceedPayment(): void {
    this.paymentCancelled = false;
    // need to be here because of gesture handler
    this.applePaySession = this.applePaySessionFactory.create(this.config.applePayVersion, this.config.paymentRequest);
    this.applePaySessionService.init(this.applePaySession, this.config.paymentRequest);

    this.applePaySession.onvalidatemerchant = (event: IApplePayValidateMerchantEvent) => {
      this.onValidateMerchant(event);
    };

    this.applePaySession.onpaymentauthorized = (event: IApplePayPaymentAuthorizedEvent) => {
      this.onPaymentAuthorized(event);
    };

    this.applePaySession.oncancel = (event: Event) => {
      this.gestureHandler();
      this.paymentCancelled = true;
      this.onCancel();
    };
  }

  private onValidateMerchant(event: IApplePayValidateMerchantEvent): void {
    this.applePayPaymentService
      .walletVerify(
        this.config.validateMerchantRequest,
        event.validationURL,
        this.paymentCancelled,
        this.applePaySession
      )
      .subscribe((code: ApplePayErrorCodes) => {
        if (code !== ApplePayErrorCodes.VALIDATE_MERCHANT_SUCCESS) {
          this.applePaySessionService.endMerchantValidation();
          this.handleWalletVerifyResponse(
            ApplePayClientStatus.VALIDATE_MERCHANT_ERROR,
            ApplePayErrorCodes.VALIDATE_MERCHANT_ERROR,
            VALIDATION_ERROR
          );
        }
        this.handleWalletVerifyResponse(
          ApplePayClientStatus.VALIDATE_MERCHANT_SUCCESS,
          ApplePayErrorCodes.VALIDATE_MERCHANT_SUCCESS,
          'Merchant validation success'
        );
        return of(code);
      });
  }

  private handleWalletVerifyResponse(status: ApplePayClientStatus, code: ApplePayErrorCodes, message: string) {
    this.messageBus.publish<IApplePayClientStatus>({
      type: PUBLIC_EVENTS.APPLE_PAY_STATUS,
      data: {
        status,
        data: { errorCode: code, errorMessage: message }
      }
    });
  }

  private onPaymentAuthorized(event: IApplePayPaymentAuthorizedEvent): void {
    this.completeFailedTransaction();
    console.error(event);
    this.applePayPaymentService
      .processPayment(
        this.config.paymentRequest.requestTypes,
        this.config.validateMerchantRequest,
        this.config.formId,
        event
      )
      .subscribe((response: any) => {
        console.error(response);
        if (Number(response.errorCode) === 0) {
          this.handlePaymentProcessResponse(ApplePayErrorCodes.SUCCESS, response.errormessage);
          this.gestureHandler();
        }
      });
  }

  private onCancel() {
    this.messageBus.publish<IApplePayClientStatus>({
      type: PUBLIC_EVENTS.APPLE_PAY_STATUS,
      data: {
        status: ApplePayClientStatus.CANCEL,
        data: {
          errorCode: ApplePayErrorCodes.CANCEL,
          errorMessage: 'Payment has been cancelled'
        }
      }
    });
  }

  private handlePaymentProcessResponse(
    errorCode: ApplePayErrorCodes,
    errorMessage: string
  ): IApplePayPaymentAuthorizationResult {
    console.error(errorCode);
    if (errorCode === ApplePayErrorCodes.SUCCESS) {
      console.error(errorCode);
      this.completion.status = ApplePaySession.STATUS_SUCCESS;
      this.messageBus.publish<IApplePayClientStatus>({
        type: PUBLIC_EVENTS.APPLE_PAY_STATUS,
        data: {
          status: ApplePayClientStatus.SUCCESS,
          data: {
            errorCode: ApplePayErrorCodes.SUCCESS,
            errorMessage
          }
        }
      });
      console.error(errorCode);
      this.applePaySession.completePayment(this.completion);
      return this.completion;
    }
    this.completion.errors = this.applePayErrorService.create(ApplePayErrorCode.UNKNOWN, this.config.locale);
    this.completion.status = ApplePaySession.STATUS_FAILURE;

    this.messageBus.publish<IApplePayClientStatus>({
      type: PUBLIC_EVENTS.APPLE_PAY_STATUS,
      data: {
        status: ApplePayClientStatus.ERROR,
        data: {
          errorCode: ApplePayErrorCodes.ERROR,
          errorMessage
        }
      }
    });
    this.applePaySession.completePayment(this.completion);
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
            errors: this.applePayErrorService.create(event.data.errormessage, this.config.locale)
          });
        }
      });
  }

  private gestureHandler(): void {
    const button = document.getElementById(APPLE_PAY_BUTTON_ID);
    const handler = () => {
      this.proceedPayment();
      button.removeEventListener('click', handler);
    };
    if (button) {
      button.addEventListener('click', handler);
    }
  }
}
