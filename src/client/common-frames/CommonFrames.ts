import { ofType } from '../../shared/services/message-bus/operators/ofType';
import { delay, filter, first, map, takeUntil } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Service } from 'typedi';
import { CONTROL_FRAME_COMPONENT_NAME, CONTROL_FRAME_IFRAME } from '../../application/core/models/constants/Selectors';
import { PAYMENT_CANCELLED } from '../../application/core/models/constants/Translations';
import { PUBLIC_EVENTS } from '../../application/core/models/constants/EventTypes';
import { BrowserLocalStorage } from '../../shared/services/storage/BrowserLocalStorage';
import { DomMethods } from '../../application/core/shared/dom-methods/DomMethods';
import { ConfigProvider } from '../../shared/services/config-provider/ConfigProvider';
import { CustomerOutput } from '../../application/core/models/constants/CustomerOutput';
import { Frame } from '../../application/core/shared/frame/Frame';
import { IframeFactory } from '../iframe-factory/IframeFactory';
import { IMessageBus } from '../../application/core/shared/message-bus/IMessageBus';
import { IMessageBusEvent } from '../../application/core/models/IMessageBusEvent';
import { IPaymentAuthorized } from '../../application/core/models/IPaymentAuthorized';
import { IStyles } from '../../shared/model/config/IStyles';
import { JwtDecoder } from '../../shared/services/jwt-decoder/JwtDecoder';
import { MessageBus } from '../../application/core/shared/message-bus/MessageBus';
import { Validation } from '../../application/core/shared/validation/Validation';

@Service()
export class CommonFrames {
  private dataCenterUrl: string;
  private destroy$: Observable<IMessageBusEvent>;
  private form: HTMLFormElement;
  private formId: string;
  private isFormSubmitted: boolean;
  private jwt: string;
  private origin: string;
  private styles: IStyles;
  private submitFields: string[];
  private submitOnError: boolean;
  private submitOnSuccess: boolean;
  private submitOnCancel: boolean;
  private validation: Validation;

  constructor(
    private configProvider: ConfigProvider,
    private frame: Frame,
    private iframeFactory: IframeFactory,
    private jwtDecoder: JwtDecoder,
    private localStorage: BrowserLocalStorage,
    private messageBus: IMessageBus
  ) {
    this.destroy$ = this.messageBus.pipe(ofType(PUBLIC_EVENTS.DESTROY));
    this.validation = new Validation();

    this.configProvider.getConfig$().subscribe(config => {
      this.dataCenterUrl = config.datacenterurl;
      this.form = document.getElementById(config.formId) as HTMLFormElement;
      this.formId = config.formId;
      this.isFormSubmitted = false;
      this.jwt = config.jwt;
      this.origin = config.origin;
      this.submitFields = config.submitFields;
      this.submitOnCancel = config.submitOnCancel;
      this.submitOnError = config.submitOnError;
      this.submitOnSuccess = config.submitOnSuccess;
      this.styles = this.getControlFrameStyles(config.styles);
    });
  }

  init(): void {
    this.appendControlFrame();
    this.merchantInputsListener();
    this.transactionCompleteListener();
  }

  private transactionCompleteListener(): void {
    this.messageBus
      .pipe(
        ofType(MessageBus.EVENTS_PUBLIC.TRANSACTION_COMPLETE),
        map(event => event.data),
        takeUntil(this.destroy$)
      )
      .subscribe((data: IPaymentAuthorized) => {
        if (data.walletsource !== 'APPLEPAY') {
          this.onTransactionCompleteEvent(data);
          return;
        }

        this.localStorage
          .select(store => store.completePayment)
          .pipe(
            filter((value: string) => value === 'true'),
            first(),
            delay(4000)
          )
          .subscribe(() => this.onTransactionCompleteEvent(data));
      });
  }

  private onTransactionCompleteEvent(data: IPaymentAuthorized): void {
    if (!this.isTransactionFinished(data)) {
      return;
    }

    if (data.errorcode === 'cancelled') {
      DomMethods.addDataToForm(this.form, { errorcode: 'cancelled', errormessage: PAYMENT_CANCELLED });
    } else {
      DomMethods.addDataToForm(this.form, data, this.getSubmitFieldsFromPaymentResponse(data));
    }

    this.messageBus.publish({ type: PUBLIC_EVENTS.CALL_MERCHANT_SUBMIT_CALLBACK, data }, true);

    if (this.shouldSubmitForm(this.getTransactionStatus(data.errorcode)) && !this.isFormSubmitted) {
      this.isFormSubmitted = true;
      this.form.submit();
    }
  }

  private isTransactionFinished(data: IPaymentAuthorized): boolean {
    const { acsurl, customeroutput, enrolled, errorcode, requesttypedescription, threedresponse } = data;

    if (Number(errorcode) !== 0) {
      return true;
    }

    if (requesttypedescription === 'WALLETVERIFY' || requesttypedescription === 'JSINIT') {
      return false;
    }

    if (customeroutput === CustomerOutput.THREEDREDIRECT) {
      return Boolean(threedresponse || !acsurl || enrolled !== 'Y');
    }

    return true;
  }

  private getSubmitFieldsFromPaymentResponse(data: IPaymentAuthorized): string[] {
    const submitFields: string[] = ['jwt', 'threedresponse', ...this.submitFields];
    const submitFieldsFromResponse: string[] = [];

    submitFields.forEach((field: string) => {
      if (data.hasOwnProperty(field)) {
        submitFieldsFromResponse.push(field);
      }
    });

    return submitFieldsFromResponse;
  }

  private getTransactionStatus(errorcode: string): string {
    if (errorcode === '0') {
      return 'success';
    }

    if (errorcode === 'cancelled') {
      return 'cancelled';
    }

    return 'error';
  }

  private shouldSubmitForm(result: string): boolean {
    return (
      (result === 'success' && this.submitOnSuccess) ||
      (result === 'cancel' && this.submitOnCancel) ||
      (result === 'error' && this.submitOnError)
    );
  }

  private appendControlFrame(): void {
    this.form.appendChild(
      this.iframeFactory.create(
        CONTROL_FRAME_COMPONENT_NAME,
        CONTROL_FRAME_IFRAME,
        this.styles.controlFrame,
        {
          gatewayUrl: this.dataCenterUrl,
          jwt: this.jwt,
          origin: this.origin
        },
        -1
      )
    );
  }

  private getControlFrameStyles(styles: IStyles): IStyles {
    if (styles.controlFrame) {
      return { controlFrame: styles.controlFrame };
    }

    if (styles.defaultStyles) {
      return { controlFrame: styles.defaultStyles };
    }

    return { controlFrame: {} };
  }

  private onMerchantFieldInput(): void {
    this.messageBus.publish({
      data: DomMethods.parseForm(this.formId),
      type: MessageBus.EVENTS_PUBLIC.UPDATE_MERCHANT_FIELDS
    });
  }

  private merchantInputsListener(): void {
    const els = DomMethods.getAllFormElements(this.form);
    for (const el of els) {
      el.addEventListener('input', this.onMerchantFieldInput.bind(this));
    }
  }
}
