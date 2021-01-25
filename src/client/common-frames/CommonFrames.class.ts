import { IStyles } from '../../shared/model/config/IStyles';
import { IframeFactory } from '../iframe-factory/IframeFactory';
import { DomMethods } from '../../application/core/shared/dom-methods/DomMethods';
import { MessageBus } from '../../application/core/shared/message-bus/MessageBus';
import { Validation } from '../../application/core/shared/validation/Validation';
import { Container } from 'typedi';
import { BrowserLocalStorage } from '../../shared/services/storage/BrowserLocalStorage';
import { IComponentsIds } from '../../shared/model/config/IComponentsIds';
import { delay, filter, first, map, takeUntil, tap } from 'rxjs/operators';
import { ofType } from '../../shared/services/message-bus/operators/ofType';
import { Observable } from 'rxjs';
import { PUBLIC_EVENTS } from '../../application/core/models/constants/EventTypes';
import { IMessageBusEvent } from '../../application/core/models/IMessageBusEvent';
import { Frame } from '../../application/core/shared/frame/Frame';
import { StJwt } from '../../application/core/shared/stjwt/StJwt';
import { PAYMENT_CANCELLED, PAYMENT_SUCCESS } from '../../application/core/models/constants/Translations';
import { CONTROL_FRAME_COMPONENT_NAME, CONTROL_FRAME_IFRAME } from '../../application/core/models/constants/Selectors';
import { CustomerOutput } from '../../application/core/models/constants/CustomerOutput';
import { IMessageBus } from '../../application/core/shared/message-bus/IMessageBus';
import { MessageBusToken } from '../../shared/dependency-injection/InjectionTokens';

export class CommonFrames {
  get requestTypes(): string[] {
    return this._requestTypes;
  }

  set requestTypes(requestTypes: string[]) {
    this._requestTypes = requestTypes;
  }

  public elementsTargets: any;
  public elementsToRegister: HTMLElement[];
  private _controlFrame: HTMLIFrameElement;
  private _messageBus: IMessageBus;
  private _requestTypes: string[];
  private readonly _gatewayUrl: string;
  private readonly _merchantForm: HTMLFormElement;
  private _validation: Validation;
  private _formSubmitted: boolean;
  private readonly _submitFields: string[];
  private readonly _submitOnError: boolean;
  private readonly _submitOnSuccess: boolean;
  private readonly _submitOnCancel: boolean;
  private _localStorage: BrowserLocalStorage = Container.get(BrowserLocalStorage);
  private _destroy$: Observable<IMessageBusEvent>;
  protected styles: IStyles;
  protected params: any;
  protected jwt: string;
  protected origin: string;
  protected componentIds: any;
  protected submitCallback: any;
  protected fieldsToSubmit: string[];
  protected messageBus: IMessageBus;
  protected formId: string;
  private _stJwt: StJwt;

  constructor(
    jwt: string,
    origin: string,
    componentIds: IComponentsIds,
    styles: IStyles,
    submitOnSuccess: boolean,
    submitOnError: boolean,
    submitOnCancel: boolean,
    submitFields: string[],
    gatewayUrl: string,
    animatedCard: boolean,
    requestTypes: string[],
    formId: string,
    private _iframeFactory: IframeFactory,
    private _frame: Frame
  ) {
    this._gatewayUrl = gatewayUrl;
    this._messageBus = Container.get(MessageBusToken);
    this.formId = formId;
    this._merchantForm = document.getElementById(formId) as HTMLFormElement;
    this._validation = new Validation();
    this._formSubmitted = false;
    this._submitFields = submitFields;
    this._submitOnError = submitOnError;
    this._submitOnCancel = submitOnCancel;
    this._submitOnSuccess = submitOnSuccess;
    this._requestTypes = requestTypes;
    this.elementsToRegister = [];
    this.componentIds = componentIds;
    this.formId = formId;
    this.componentIds = componentIds;
    this.elementsToRegister = [];
    this.jwt = jwt;
    this.origin = origin;
    this.styles = this._getStyles(styles);
    this._stJwt = new StJwt(jwt);
    this.params = { locale: this._stJwt.locale, origin: this.origin };
    this._destroy$ = this._messageBus.pipe(ofType(PUBLIC_EVENTS.DESTROY));
    this.styles = this._getStyles(styles);
  }

  public init() {
    this._initFormFields();
    this._setMerchantInputListeners();
    this._setTransactionCompleteListener();
    this.elementsTargets = this.setElementsFields();
    this.registerElements(this.elementsToRegister, this.elementsTargets);
  }

  private _getStyles(styles: any) {
    for (const key in styles) {
      if (styles[key] instanceof Object) {
        return styles;
      }
    }
    styles = { defaultStyles: styles };
    return styles;
  }

  protected registerElements(fields: HTMLElement[], targets: string[]) {
    targets.map((item, index) => {
      const itemToChange = document.getElementById(item);
      if (fields[index]) {
        itemToChange.appendChild(fields[index]);
      }
    });
  }

  protected setElementsFields() {
    const elements = [];
    elements.push(this.formId);
    return elements;
  }

  private _getSubmitFields(data: any) {
    const fields = this._submitFields;
    if (data.hasOwnProperty('jwt') && fields.indexOf('jwt') === -1) {
      fields.push('jwt');
    }
    if (data.hasOwnProperty('threedresponse') && fields.indexOf('threedresponse') === -1) {
      fields.push('threedresponse');
    }
    return fields;
  }

  private _initFormFields() {
    const { defaultStyles } = this.styles;
    let { controlFrame } = this.styles;

    controlFrame = Object.assign({}, defaultStyles, controlFrame);

    this._controlFrame = this._iframeFactory.create(
      CONTROL_FRAME_COMPONENT_NAME,
      CONTROL_FRAME_IFRAME,
      controlFrame,
      {
        gatewayUrl: this._gatewayUrl,
        jwt: this.jwt,
        origin: this.origin
      },
      -1
    );

    this.elementsToRegister.push(this._controlFrame);
  }

  private _isTransactionFinished(data: any): boolean {
    if (Number(data.errorcode) !== 0) {
      return true;
    }

    if (data.requesttypedescription === 'WALLETVERIFY' || data.requesttypedescription === 'JSINIT') {
      return false;
    }

    if (data.customeroutput === CustomerOutput.THREEDREDIRECT) {
      return Boolean(data.threedresponse || !data.acsurl || data.enrolled !== 'Y');
    }

    return true;
  }

  private _onInput(event: Event) {
    const messageBusEvent = {
      data: DomMethods.parseForm(this.formId),
      type: MessageBus.EVENTS_PUBLIC.UPDATE_MERCHANT_FIELDS
    };
    this._messageBus.publish(messageBusEvent);
  }

  private _onTransactionComplete(data: any): void {
    this.addSubmitData(data);
    if (!this._isTransactionFinished(data)) {
      return;
    }

    const submitCallbackDataEvent: IMessageBusEvent = {
      type: PUBLIC_EVENTS.CALL_MERCHANT_SUBMIT_CALLBACK,
      data
    };

    this._messageBus.publish(submitCallbackDataEvent, true);

    let result: 'success' | 'error' | 'cancel';

    switch (data.errorcode) {
      case '0':
        result = 'success';
        data = { ...data, errormessage: PAYMENT_SUCCESS };
        break;
      case 'cancelled':
        result = 'cancel';
        data = { ...data, errormessage: PAYMENT_CANCELLED };
        break;
      default:
        result = 'error';
        break;
    }

    if (
      (result === 'success' && this._submitOnSuccess) ||
      (result === 'cancel' && this._submitOnCancel) ||
      (result === 'error' && this._submitOnError)
    ) {
      this._submitForm();
    }
  }

  private _submitForm() {
    if (!this._formSubmitted) {
      this._formSubmitted = true;
      this._merchantForm.submit();
    }
  }

  private addSubmitData(data: any) {
    DomMethods.addDataToForm(this._merchantForm, data, this._getSubmitFields(data));
  }

  private _setMerchantInputListeners() {
    const els = DomMethods.getAllFormElements(this._merchantForm);
    for (const el of els) {
      el.addEventListener('input', this._onInput.bind(this));
    }
  }

  private _setTransactionCompleteListener() {
    this._messageBus
      .pipe(
        ofType(MessageBus.EVENTS_PUBLIC.TRANSACTION_COMPLETE),
        map(event => event.data),
        takeUntil(this._destroy$)
      )
      .subscribe((data: any) => {
        if (data.walletsource !== 'APPLEPAY') {
          this._onTransactionComplete(data);
          return;
        }

        this._localStorage
          .select(store => store.completePayment)
          .pipe(
            filter((value: string) => value === 'true'),
            first(),
            delay(4000)
          )
          .subscribe(() => this._onTransactionComplete(data));
      });
  }
}
