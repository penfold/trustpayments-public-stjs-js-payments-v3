import { Container, Service } from 'typedi';
import { EMPTY, Observable, of, throwError } from 'rxjs';
import { catchError, filter, first, map, switchMap, tap } from 'rxjs/operators';
import { VisaCheckoutClient } from '../../../client/integrations/visa-checkout/VisaCheckoutClient';
import { StCodec } from '../../core/services/st-codec/StCodec';
import { FormFieldsDetails } from '../../core/models/constants/FormFieldsDetails';
import { FormFieldsValidity } from '../../core/models/constants/FormFieldsValidity';
import { FormState } from '../../core/models/constants/FormState';
import { ICard } from '../../core/models/ICard';
import { IFormFieldsDetails } from '../../core/models/IFormFieldsDetails';
import { IFormFieldState } from '../../core/models/IFormFieldState';
import { IFormFieldsValidity } from '../../core/models/IFormFieldsValidity';
import { IMerchantData } from '../../core/models/IMerchantData';
import { IMessageBusEvent } from '../../core/models/IMessageBusEvent';
import { IResponseData } from '../../core/models/IResponseData';
import { ISubmitData } from '../../core/models/ISubmitData';
import {
  COMMUNICATION_ERROR_INVALID_RESPONSE,
  PAYMENT_CANCELLED,
  PAYMENT_ERROR,
  PAYMENT_SUCCESS,
} from '../../core/models/constants/Translations';
import { MessageBus } from '../../core/shared/message-bus/MessageBus';
import { Payment } from '../../core/shared/payment/Payment';
import { Validation } from '../../core/shared/validation/Validation';
import { BrowserLocalStorage } from '../../../shared/services/storage/BrowserLocalStorage';
import { InterFrameCommunicator } from '../../../shared/services/message-bus/InterFrameCommunicator';
import { NotificationService } from '../../../client/notification/NotificationService';
import { IConfig } from '../../../shared/model/config/IConfig';
import { ofType } from '../../../shared/services/message-bus/operators/ofType';
import { IThreeDInitResponse } from '../../core/models/IThreeDInitResponse';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { PUBLIC_EVENTS } from '../../core/models/constants/EventTypes';
import { Frame } from '../../core/shared/frame/Frame';
import { CONFIG } from '../../../shared/dependency-injection/InjectionTokens';
import { JwtDecoder } from '../../../shared/services/jwt-decoder/JwtDecoder';
import { RequestType } from '../../../shared/types/RequestType';
import { IThreeDQueryResponse } from '../../core/models/IThreeDQueryResponse';
import { IMessageBus } from '../../core/shared/message-bus/IMessageBus';
import { ThreeDProcess } from '../../core/services/three-d-verification/ThreeDProcess';
import { PaymentController } from '../../core/services/payments/PaymentController';
import { IUpdateJwt } from '../../core/models/IUpdateJwt';
import { ITranslator } from '../../core/shared/translator/ITranslator';
import { IStJwtPayload } from '../../core/models/IStJwtPayload';
import { EventScope } from '../../core/models/constants/EventScope';
import { ApplePayClient } from '../../../integrations/apple-pay/client/ApplePayClient';
import { FraudControlService } from '../../core/services/fraud-control/FraudControlService';
import { ValidationFactory } from '../../core/shared/validation/ValidationFactory';

@Service()
export class ControlFrame {
  private static ALLOWED_PARAMS: string[] = ['jwt', 'gatewayUrl'];

  private static setFormFieldValidity(field: IFormFieldState, data: IFormFieldState): void {
    field.validity = data.validity;
  }

  private static setFormFieldValue(field: IFormFieldState, data: IFormFieldState): void {
    field.value = data.value;
  }

  private resetJwt(): void {
    StCodec.resetJwt();
  }

  private card: ICard = {
    pan: '',
    expirydate: '',
    securitycode: '',
  };
  private isPaymentReady = false;
  private formFields: IFormFieldsDetails = FormFieldsDetails;
  private formFieldsValidity: IFormFieldsValidity = FormFieldsValidity;
  private cardPaymentMethodName = 'CARD';
  private merchantFormData: IMerchantData;
  private payment: Payment;
  private remainingRequestTypes: RequestType[];
  private validation: Validation;
  private slicedPan: string;

  constructor(
    private localStorage: BrowserLocalStorage,
    private communicator: InterFrameCommunicator,
    private configProvider: ConfigProvider,
    private notification: NotificationService,
    private fraudControlService: FraudControlService,
    private threeDProcess: ThreeDProcess,
    private messageBus: IMessageBus,
    private frame: Frame,
    private jwtDecoder: JwtDecoder,
    private visaCheckoutClient: VisaCheckoutClient,
    private applePayClient: ApplePayClient,
    private paymentController: PaymentController,
    private translator: ITranslator,
    private validationFactory: ValidationFactory
  ) {
    this.validation = validationFactory.create();
    this.init();
    this.initVisaCheckout();
    this.initCardPayments();
    this.initJsInit();
    this.initConfigChange();
  }

  private init(): void {
    this.updateJwtEvent();

    this.communicator.whenReceive(PUBLIC_EVENTS.INIT_CONTROL_FRAME).thenRespond((event: IMessageBusEvent<string>) => {
      const config: IConfig = JSON.parse(event.data);

      this.messageBus.publish({
        type: PUBLIC_EVENTS.CONFIG_CHANGED,
        data: config,
      });

      if (config.jwt) {
        StCodec.updateJwt(config.jwt);
      }

      this.updateMerchantFieldsEvent();
      this.paymentController.init();

      return of(config);
    });
  }

  initCardPayments(): void {

    this.messageBus
      .pipe(ofType(PUBLIC_EVENTS.CARD_PAYMENTS_INIT))
      .pipe(
        first(),
        tap(() => {
          this.messageBus.publish({
              type: PUBLIC_EVENTS.PAYMENT_METHOD_INIT_STARTED,
              data: {
                name: this.cardPaymentMethodName,
              },
            },
            EventScope.EXPOSED
          );
        })
      )
      .subscribe((event: IMessageBusEvent<string>) => {
        this.setFormFieldsValidities();
        this.formFieldChangeEvent(MessageBus.EVENTS.CHANGE_CARD_NUMBER, this.formFields.cardNumber);
        this.formFieldChangeEvent(MessageBus.EVENTS.CHANGE_EXPIRATION_DATE, this.formFields.expirationDate);
        this.formFieldChangeEvent(MessageBus.EVENTS.CHANGE_SECURITY_CODE, this.formFields.securityCode);
        this.submitFormEvent();
        this.initThreeDProcess(JSON.parse(event.data));
      });
  }

  private initVisaCheckout(): void {
    this.messageBus
      .pipe(ofType(PUBLIC_EVENTS.VISA_CHECKOUT_INIT))
      .pipe(
        first(),
        switchMap(() => {
          return this.visaCheckoutClient.init$();
        })
      )
      .subscribe();
  }

  private initJsInit(): void {
    this.messageBus
      .pipe(
        ofType(PUBLIC_EVENTS.JSINIT_RESPONSE),
        filter((event: IMessageBusEvent<IThreeDInitResponse>) => Boolean(event.data.maskedpan)),
        map((event: IMessageBusEvent<IThreeDInitResponse>) => event.data.maskedpan)
      )
      .subscribe((maskedpan: string) => {
        this.slicedPan = maskedpan.slice(0, 6);
        this.localStorage.setItem('app.maskedpan', this.slicedPan);

        this.messageBus.publish({
          type: PUBLIC_EVENTS.BIN_PROCESS,
          data: this.slicedPan,
        });
      });
  }

  private initConfigChange(): void {
    this.messageBus.pipe(ofType(PUBLIC_EVENTS.CONFIG_CHANGED)).subscribe((event: IMessageBusEvent<IConfig>) => {
      if (event.data) {
        Container.set(CONFIG, event.data);
        return;
      }
    });
  }

  private formFieldChangeEvent(event: string, field: IFormFieldState): void {
    this.messageBus.subscribeType(event, (data: IFormFieldState) => {
      this.formFieldChange(event, data.value);
      ControlFrame.setFormFieldValidity(field, data);
      ControlFrame.setFormFieldValue(field, data);
    });
  }

  private setRequestTypes(jwt: string): void {
    const { payload } = this.jwtDecoder.decode<IStJwtPayload>(jwt);
    this.remainingRequestTypes = payload.requesttypedescriptions;
  }

  private updateJwtEvent(): void {
    this.messageBus.subscribeType(PUBLIC_EVENTS.UPDATE_JWT, (data: IUpdateJwt) => {
      StCodec.updateJwt(data.newJwt);
    });
  }

  private updateMerchantFieldsEvent(): void {
    this.messageBus.subscribeType(PUBLIC_EVENTS.UPDATE_MERCHANT_FIELDS, (data: IMerchantData) => {
      this.updateMerchantFields(data);
    });
  }

  private submitFormEvent(): void {
    this.messageBus
      .pipe(
        ofType(PUBLIC_EVENTS.SUBMIT_FORM),
        map((event: IMessageBusEvent<ISubmitData>) => event.data || {}),
        switchMap((data: ISubmitData) => {
          this.isPaymentReady = true;
          if (!this.isDataValid(data)) {
            this.messageBus.publish({ type: PUBLIC_EVENTS.CALL_MERCHANT_ERROR_CALLBACK }, EventScope.ALL_FRAMES);
            this.messageBus.publish({
              type: PUBLIC_EVENTS.PAYMENT_METHOD_FAILED,
              data: { name: this.cardPaymentMethodName },
            }, EventScope.EXPOSED);
            this.messageBus.publish({
              type: PUBLIC_EVENTS.BLOCK_FORM,
              data: FormState.AVAILABLE,
            }, EventScope.ALL_FRAMES);
            this.validateFormFields();
            return EMPTY;
          }

          return this.configProvider.getConfig$().pipe(
            tap(config => this.setRequestTypes(config.jwt)),
            tap(() => {
              this.messageBus.publish({
                  type: PUBLIC_EVENTS.PAYMENT_METHOD_STARTED,
                  data: {
                    name: this.cardPaymentMethodName,
                  },
                },
                EventScope.EXPOSED
              );
            }),
            switchMap(() =>
              this.callThreeDQueryRequest().pipe(
                catchError(errorData => {
                  if (errorData.isCancelled) {
                    return this.onPaymentCancel(errorData);
                  }

                  return this.onPaymentFailure(errorData);
                }),
                catchError(() => EMPTY)
              )
            )
          );
        })
      )
      .subscribe(threeDQueryResponse => this.processPayment(threeDQueryResponse));
  }

  private isDataValid(data: ISubmitData): boolean {
    const dataInJwt = data ? data.dataInJwt : false;
    const { validity } = this.validation.formValidation(
      dataInJwt,
      data.fieldsToSubmit,
      this.formFields,
      this.isPaymentReady
    );

    return validity;
  }

  private onPaymentFailure(errorData: IResponseData, errorMessage: string = PAYMENT_ERROR): Observable<never> {
    const translatedErrorMessage = this.translator.translate(errorMessage);
    errorData.errormessage = translatedErrorMessage;

    if (!(errorData instanceof Error)) {
      this.messageBus.publish({ type: PUBLIC_EVENTS.CALL_MERCHANT_ERROR_CALLBACK }, EventScope.ALL_FRAMES);
      this.messageBus.publish({
        type: PUBLIC_EVENTS.PAYMENT_METHOD_FAILED,
        data: { name: this.cardPaymentMethodName },
      }, EventScope.EXPOSED);
      StCodec.publishResponse(errorData, errorData.jwt);
    }

    this.resetJwt();
    this.messageBus.publish({ type: PUBLIC_EVENTS.BLOCK_FORM, data: FormState.AVAILABLE }, EventScope.ALL_FRAMES);
    this.notification.error(translatedErrorMessage);

    return throwError(errorData);
  }

  private onPaymentCancel(errorData: IResponseData, errorMessage: string = PAYMENT_CANCELLED): Observable<never> {
    const translatedErrorMessage = this.translator.translate(errorMessage);
    errorData.errormessage = translatedErrorMessage;

    if (!(errorData instanceof Error)) {
      this.messageBus.publish({ type: PUBLIC_EVENTS.CALL_MERCHANT_CANCEL_CALLBACK }, EventScope.ALL_FRAMES);
      this.messageBus.publish({
        type: PUBLIC_EVENTS.PAYMENT_METHOD_CANCELED,
        data: { name: this.cardPaymentMethodName },
      }, EventScope.EXPOSED);
      StCodec.publishResponse(errorData, errorData.jwt);
    }

    this.resetJwt();
    this.messageBus.publish({ type: PUBLIC_EVENTS.BLOCK_FORM, data: FormState.AVAILABLE }, EventScope.ALL_FRAMES);
    this.notification.cancel(translatedErrorMessage);

    return throwError(errorData);
  }

  private processPayment(responseData: IResponseData): Promise<void> {
    this.setRequestTypes(StCodec.jwt);

    return this.payment
      .processPayment(this.remainingRequestTypes, this.card, this.merchantFormData, responseData)
      .then(() => {
        this.messageBus.publish(
          {
            type: PUBLIC_EVENTS.CALL_MERCHANT_SUCCESS_CALLBACK,
          },
          EventScope.ALL_FRAMES
        );
        this.notification.success(PAYMENT_SUCCESS);
        this.messageBus.publish({
            type: PUBLIC_EVENTS.PAYMENT_METHOD_COMPLETED,
            data: {
              name: this.cardPaymentMethodName,
            },
          },
          EventScope.EXPOSED
        );
        this.validation.blockForm(FormState.COMPLETE);
      })
      .catch(() => {
        this.messageBus.publish({ type: PUBLIC_EVENTS.CALL_MERCHANT_ERROR_CALLBACK }, EventScope.ALL_FRAMES);
        this.messageBus.publish({
          type: PUBLIC_EVENTS.PAYMENT_METHOD_FAILED,
          data: { name: this.cardPaymentMethodName },
        }, EventScope.EXPOSED);
        this.notification.error(PAYMENT_ERROR);
        this.validation.blockForm(FormState.AVAILABLE);
      })
      .finally(() => {
        this.resetJwt();
      });
  }

  private callThreeDQueryRequest(): Observable<IThreeDQueryResponse> {
    const applyFraudControl = (merchantFormData: IMerchantData) =>
      this.fraudControlService.getTransactionId().pipe(
        map(fraudControlTid => {
          if (!fraudControlTid) {
            return merchantFormData;
          }

          return {
            ...merchantFormData,
            fraudcontroltransactionid: fraudControlTid,
          };
        })
      );

    return of({ ...this.merchantFormData }).pipe(
      switchMap(applyFraudControl),
      switchMap(merchantFormData =>
        this.threeDProcess.performThreeDQuery$(this.remainingRequestTypes, this.card, merchantFormData)
      )
    );
  }

  private validateFormFields() {
    this.publishBlurEvent({
      type: MessageBus.EVENTS.BLUR_CARD_NUMBER,
    });
    this.publishBlurEvent({
      type: MessageBus.EVENTS.BLUR_EXPIRATION_DATE,
    });
    this.publishBlurEvent({
      type: MessageBus.EVENTS.BLUR_SECURITY_CODE,
    });
    this.validation.setFormValidity(this.formFieldsValidity);
  }

  private publishBlurEvent(event: IMessageBusEvent): void {
    this.messageBus.publish(event);
  }

  private formFieldChange(event: string, value: string) {
    switch (event) {
      case MessageBus.EVENTS.CHANGE_CARD_NUMBER:
        this.setCardPan(value);
        break;
      case MessageBus.EVENTS.CHANGE_EXPIRATION_DATE:
        this.setCardExpiryDate(value);
        break;
      case MessageBus.EVENTS.CHANGE_SECURITY_CODE:
        this.setCardSecurityCode(value);
        break;
    }
  }

  private getJwt(): string {
    return this.frame.parseUrl(ControlFrame.ALLOWED_PARAMS).jwt;
  }

  private getPanFromJwt(): string {
    const jwt: string = this.getJwt();
    const decoded = this.jwtDecoder.decode<IStJwtPayload>(jwt);

    return decoded.payload.pan || '';
  }

  private setCardExpiryDate(value: string): void {
    this.card.expirydate = value;
  }

  private setCardPan(value: string): void {
    this.card.pan = value;
  }

  private setCardSecurityCode(value: string): void {
    this.card.securitycode = value;
  }

  private setFormFieldsValidities(): void {
    this.formFieldsValidity.cardNumber.state = this.formFields.cardNumber.validity;
    this.formFieldsValidity.expirationDate.state = this.formFields.expirationDate.validity;
    this.formFieldsValidity.securityCode.state = this.formFields.securityCode.validity;
  }

  private updateMerchantFields(data: IMerchantData): void {
    this.merchantFormData = data;
  }

  private initThreeDProcess(config: IConfig): void {
    this.threeDProcess.init$().pipe(
      catchError((error,caught) => {
        this.messageBus.publish({
            type: PUBLIC_EVENTS.PAYMENT_METHOD_INIT_FAILED,
            data: {
              name: this.cardPaymentMethodName,
            },
          },
          EventScope.EXPOSED
        );

        return throwError(error);
      })
    ).subscribe({
      next: () => {
        this.isPaymentReady = true;
        this.messageBus.publish({
            type: PUBLIC_EVENTS.PAYMENT_METHOD_INIT_COMPLETED,
            data: {
              name: this.cardPaymentMethodName,
            },
          },
          EventScope.EXPOSED
        );

        if (config.components.startOnLoad) {
          this.messageBus.publish({
            type: PUBLIC_EVENTS.BIN_PROCESS,
            data: this.jwtDecoder.decode<IStJwtPayload>(config.jwt).payload.pan,
          });

          this.messageBus.publish(
            {
              type: PUBLIC_EVENTS.SUBMIT_FORM,
              data: {
                dataInJwt: true,
                requestTypes: this.remainingRequestTypes,
              },
            },
            EventScope.ALL_FRAMES
          );
        }
      },
      error: (errorData: IResponseData) => this.onPaymentFailure(errorData, COMMUNICATION_ERROR_INVALID_RESPONSE),
    });
  }
}
