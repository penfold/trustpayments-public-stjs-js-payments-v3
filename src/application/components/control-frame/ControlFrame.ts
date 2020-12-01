import { StCodec } from '../../core/services/st-codec/StCodec.class';
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
import { PAYMENT_SUCCESS, PAYMENT_ERROR } from '../../core/models/constants/Translations';
import { MessageBus } from '../../core/shared/message-bus/MessageBus';
import { Payment } from '../../core/shared/payment/Payment';
import { Validation } from '../../core/shared/validation/Validation';
import { iinLookup } from '@trustpayments/ts-iin-lookup';
import { BrowserLocalStorage } from '../../../shared/services/storage/BrowserLocalStorage';
import { Container, Service } from 'typedi';
import { InterFrameCommunicator } from '../../../shared/services/message-bus/InterFrameCommunicator';
import { NotificationService } from '../../../client/notification/NotificationService';
import { Cybertonica } from '../../core/integrations/cybertonica/Cybertonica';
import { IConfig } from '../../../shared/model/config/IConfig';
import { CardinalCommerce } from '../../core/integrations/cardinal-commerce/CardinalCommerce';
import { ICardinalCommerceTokens } from '../../core/integrations/cardinal-commerce/ICardinalCommerceTokens';
import { defer, EMPTY, from, iif, Observable, of, throwError } from 'rxjs';
import { catchError, filter, map, mapTo, switchMap, tap } from 'rxjs/operators';
import { StJwt } from '../../core/shared/stjwt/StJwt';
import { Translator } from '../../core/shared/translator/Translator';
import { ofType } from '../../../shared/services/message-bus/operators/ofType';
import { IThreeDInitResponse } from '../../core/models/IThreeDInitResponse';
import { Store } from '../../core/store/Store';
import { ConfigProvider } from '../../../shared/services/config-provider/ConfigProvider';
import { UPDATE_CONFIG } from '../../core/store/reducers/config/ConfigActions';
import { PUBLIC_EVENTS } from '../../core/models/constants/EventTypes';
import { ConfigService } from '../../../shared/services/config-service/ConfigService';
import { Frame } from '../../core/shared/frame/Frame';
import { Styler } from '../../core/shared/styler/Styler';
import { CONFIG } from '../../../shared/dependency-injection/InjectionTokens';
import { JwtDecoder } from '../../../shared/services/jwt-decoder/JwtDecoder';
import { RequestType } from '../../../shared/types/RequestType';
import { IThreeDQueryResponse } from '../../core/models/IThreeDQueryResponse';

@Service()
export class ControlFrame {
  private static ALLOWED_PARAMS: string[] = ['jwt', 'gatewayUrl'];
  private static NON_CVV_CARDS: string[] = ['PIBA'];

  private static _setFormFieldValidity(field: IFormFieldState, data: IFormFieldState): void {
    field.validity = data.validity;
  }

  private static _setFormFieldValue(field: IFormFieldState, data: IFormFieldState): void {
    field.value = data.value;
  }

  private static _resetJwt(): void {
    StCodec.jwt = StCodec.originalJwt;
  }

  private static _updateJwt(jwt: string): void {
    StCodec.jwt = jwt;
    StCodec.originalJwt = jwt;
  }

  private _card: ICard = {
    pan: '',
    expirydate: '',
    securitycode: ''
  };
  private _isPaymentReady: boolean = false;
  private _formFields: IFormFieldsDetails = FormFieldsDetails;
  private _formFieldsValidity: IFormFieldsValidity = FormFieldsValidity;
  private _merchantFormData: IMerchantData;
  private _payment: Payment;
  private _remainingRequestTypes: RequestType[];
  private _validation: Validation;
  private _slicedPan: string;

  constructor(
    private _localStorage: BrowserLocalStorage,
    private _communicator: InterFrameCommunicator,
    private _configProvider: ConfigProvider,
    private _notification: NotificationService,
    private _cybertonica: Cybertonica,
    private _cardinalCommerce: CardinalCommerce,
    private _store: Store,
    private _configService: ConfigService,
    private _messageBus: MessageBus,
    private _frame: Frame,
    private _jwtDecoder: JwtDecoder
  ) {
    this._communicator
      .whenReceive(MessageBus.EVENTS_PUBLIC.INIT_CONTROL_FRAME)
      .thenRespond((event: IMessageBusEvent<string>) => {
        const config: IConfig = JSON.parse(event.data);
        this._messageBus.publish({
          type: PUBLIC_EVENTS.CONFIG_CHANGED,
          data: config
        });

        this.init(config);

        return of(config);
      });

    this._messageBus
      .pipe(
        ofType(MessageBus.EVENTS_PUBLIC.JSINIT_RESPONSE),
        filter((event: IMessageBusEvent<IThreeDInitResponse>) => Boolean(event.data.maskedpan)),
        map((event: IMessageBusEvent<IThreeDInitResponse>) => event.data.maskedpan)
      )
      .subscribe((maskedpan: string) => {
        this._slicedPan = maskedpan.slice(0, 6);
        this._localStorage.setItem('app.maskedpan', this._slicedPan);

        this._messageBus.publish({
          type: MessageBus.EVENTS_PUBLIC.BIN_PROCESS,
          data: this._slicedPan
        });
      });

    this._messageBus.pipe(ofType(PUBLIC_EVENTS.CONFIG_CHANGED)).subscribe((event: IMessageBusEvent<IConfig>) => {
      if (event.data) {
        this._store.dispatch({ type: UPDATE_CONFIG, payload: event.data });
        Container.set(CONFIG, event.data);
        return;
      }
    });
  }

  protected init(config: IConfig): void {
    const styler: Styler = new Styler(this._frame.getAllowedStyles(), this._frame.parseUrl().styles);
    this._setInstances();
    this._setFormFieldsValidities();
    this._formFieldChangeEvent(MessageBus.EVENTS.CHANGE_CARD_NUMBER, this._formFields.cardNumber);
    this._formFieldChangeEvent(MessageBus.EVENTS.CHANGE_EXPIRATION_DATE, this._formFields.expirationDate);
    this._formFieldChangeEvent(MessageBus.EVENTS.CHANGE_SECURITY_CODE, this._formFields.securityCode);
    this._submitFormEvent();
    this._updateMerchantFieldsEvent();
    this._resetJwtEvent();
    this._updateJwtEvent();
    this._initCybertonica(config);
    this._setRequestTypes(config.jwt);

    if (!config.deferInit) {
      this._initCardinalCommerce(config);
    } else if (config.components.startOnLoad) {
      this._messageBus.publish({
        type: MessageBus.EVENTS_PUBLIC.SUBMIT_FORM,
        data: {
          dataInJwt: true,
          requestTypes: this._remainingRequestTypes
        }
      });
    }

    this._messageBus.subscribe(
      MessageBus.EVENTS_PUBLIC.CARDINAL_COMMERCE_TOKENS_ACQUIRED,
      (tokens: ICardinalCommerceTokens) => {
        this._payment.setCardinalCommerceCacheToken(tokens.cacheToken);
      }
    );
  }

  private _formFieldChangeEvent(event: string, field: IFormFieldState): void {
    this._messageBus.subscribe(event, (data: IFormFieldState) => {
      this._formFieldChange(event, data.value);
      ControlFrame._setFormFieldValidity(field, data);
      ControlFrame._setFormFieldValue(field, data);
    });
  }

  private _resetJwtEvent(): void {
    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.RESET_JWT, () => {
      ControlFrame._resetJwt();
    });
  }

  private _setRequestTypes(jwt: string): void {
    const { payload } = this._jwtDecoder.decode(jwt);
    this._remainingRequestTypes = payload.requesttypedescriptions;
  }

  private _updateJwtEvent(): void {
    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.UPDATE_JWT, (data: any) => {
      ControlFrame._updateJwt(data.newJwt);
    });
  }

  private _updateMerchantFieldsEvent(): void {
    this._messageBus.subscribe(MessageBus.EVENTS_PUBLIC.UPDATE_MERCHANT_FIELDS, (data: IMerchantData) => {
      this._updateMerchantFields(data);
    });
  }

  private _submitFormEvent(): void {
    this._messageBus
      .pipe(
        ofType(MessageBus.EVENTS_PUBLIC.SUBMIT_FORM),
        map((event: IMessageBusEvent<ISubmitData>) => event.data || {}),
        switchMap((data: ISubmitData) => {
          this._isPaymentReady = true;
          if (!this._isDataValid(data)) {
            this._messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK }, true);
            this._messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.BLOCK_FORM, data: FormState.AVAILABLE }, true);
            this._validateFormFields();
            return EMPTY;
          }

          return this._configProvider.getConfig$().pipe(
            tap(config => this._setRequestTypes(config.jwt)),
            switchMap(config =>
              iif(
                () => config.deferInit,
                defer(() => this._cardinalCommerce.init(config).pipe(mapTo(data))),
                of(data)
              ).pipe(mapTo(config))
            ),
            switchMap(() =>
              this._callThreeDQueryRequest().pipe(
                catchError(errorData => this._onPaymentFailure(errorData)),
                catchError(() => EMPTY)
              )
            )
          );
        })
      )
      .subscribe(threeDQueryResponse => this._processPayment(threeDQueryResponse));
  }

  private _isDataValid(data: ISubmitData): boolean {
    const isPanPiba: boolean = this._isCardWithoutCVV();
    const dataInJwt = data ? data.dataInJwt : false;
    const { validity } = this._validation.formValidation(
      dataInJwt,
      data.fieldsToSubmit,
      this._formFields,
      isPanPiba,
      this._isPaymentReady
    );

    return validity;
  }

  private _onPaymentFailure(errorData: IResponseData): Observable<never> {
    const translator = new Translator(this._localStorage.getItem('locale'));
    const translatedErrorMessage = translator.translate(PAYMENT_ERROR);

    this._messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.RESET_JWT });

    errorData.errormessage = translatedErrorMessage;

    StCodec.publishResponse(errorData, errorData.jwt, errorData.threedresponse);

    this._messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.BLOCK_FORM, data: FormState.AVAILABLE }, true);
    this._notification.error(translatedErrorMessage);

    return throwError(errorData);
  }

  private _processPayment(responseData: IResponseData): void {
    this._setRequestTypes(StCodec.jwt);

    this._payment
      .processPayment(this._remainingRequestTypes, this._card, this._merchantFormData, responseData)
      .then(() => {
        this._messageBus.publish(
          {
            type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_SUCCESS_CALLBACK
          },
          true
        );
        this._notification.success(PAYMENT_SUCCESS);
        this._validation.blockForm(FormState.COMPLETE);
      })
      .catch((error: any) => {
        this._messageBus.publish({ type: MessageBus.EVENTS_PUBLIC.CALL_MERCHANT_ERROR_CALLBACK }, true);
        this._notification.error(PAYMENT_ERROR);
        this._validation.blockForm(FormState.AVAILABLE);
      })
      .finally(() => {
        ControlFrame._resetJwt();
      });
  }

  private _isCardWithoutCVV(): boolean {
    const panFromJwt: string = this._getPanFromJwt();
    let pan: string = '';
    if (panFromJwt || this._formFields.cardNumber.value) {
      pan = panFromJwt ? panFromJwt : this._formFields.cardNumber.value;
    }

    const cardType: string = iinLookup.lookup(pan).type;
    return ControlFrame.NON_CVV_CARDS.includes(cardType);
  }

  private _callThreeDQueryRequest(): Observable<IThreeDQueryResponse> {
    const applyCybertonicaTid = (merchantFormData: IMerchantData) =>
      from(this._cybertonica.getTransactionId()).pipe(
        map(cybertonicaTid => {
          if (!cybertonicaTid) {
            return merchantFormData;
          }

          return {
            ...merchantFormData,
            fraudcontroltransactionid: cybertonicaTid
          };
        })
      );

    return of({ ...this._merchantFormData }).pipe(
      switchMap(applyCybertonicaTid),
      switchMap(merchantFormData =>
        this._cardinalCommerce.performThreeDQuery(this._remainingRequestTypes, this._card, merchantFormData)
      )
    );
  }

  private _validateFormFields() {
    this._publishBlurEvent({
      type: MessageBus.EVENTS.BLUR_CARD_NUMBER
    });
    this._publishBlurEvent({
      type: MessageBus.EVENTS.BLUR_EXPIRATION_DATE
    });
    this._publishBlurEvent({
      type: MessageBus.EVENTS.BLUR_SECURITY_CODE
    });
    this._validation.setFormValidity(this._formFieldsValidity);
  }

  private _publishBlurEvent(event: IMessageBusEvent): void {
    this._messageBus.publish(event);
  }

  private _formFieldChange(event: string, value: string) {
    switch (event) {
      case MessageBus.EVENTS.CHANGE_CARD_NUMBER:
        this._setCardPan(value);
        break;
      case MessageBus.EVENTS.CHANGE_EXPIRATION_DATE:
        this._setCardExpiryDate(value);
        break;
      case MessageBus.EVENTS.CHANGE_SECURITY_CODE:
        this._setCardSecurityCode(value);
        break;
    }
  }

  private _getJwt(): string {
    return this._frame.parseUrl(ControlFrame.ALLOWED_PARAMS).jwt;
  }

  private _getPanFromJwt(): string {
    const jwt: string = this._getJwt();
    const decoded = this._jwtDecoder.decode(jwt);

    return decoded.payload.pan || '';
  }

  private _setCardExpiryDate(value: string): void {
    this._card.expirydate = value;
  }

  private _setCardPan(value: string): void {
    this._card.pan = value;
  }

  private _setCardSecurityCode(value: string): void {
    this._card.securitycode = value;
  }

  private _setFormFieldsValidities(): void {
    this._formFieldsValidity.cardNumber.state = this._formFields.cardNumber.validity;
    this._formFieldsValidity.expirationDate.state = this._formFields.expirationDate.validity;
    this._formFieldsValidity.securityCode.state = this._formFields.securityCode.validity;
  }

  private _setInstances(): void {
    this._payment = new Payment();
    this._validation = new Validation();
  }

  private _updateMerchantFields(data: IMerchantData): void {
    this._merchantFormData = data;
  }

  private _initCybertonica(config: IConfig): void {
    const { cybertonicaApiKey } = config;

    if (cybertonicaApiKey) {
      this._cybertonica.init(cybertonicaApiKey);
    }
  }

  private _initCardinalCommerce(config: IConfig): void {
    this._cardinalCommerce.init(config).subscribe(() => {
      this._isPaymentReady = true;

      if (config.components.startOnLoad) {
        this._messageBus.publish({
          type: MessageBus.EVENTS_PUBLIC.BIN_PROCESS,
          data: new StJwt(config.jwt).payload.pan as string
        });

        this._messageBus.publish(
          {
            type: MessageBus.EVENTS_PUBLIC.SUBMIT_FORM,
            data: {
              dataInJwt: true,
              requestTypes: this._remainingRequestTypes
            }
          },
          true
        );
      }
    });
  }
}
