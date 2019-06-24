import Element from '../Element';
import DomMethods from '../shared/DomMethods';
import MessageBus from '../shared/MessageBus';
import Selectors from '../shared/Selectors';
import { IStyles } from '../shared/Styler';
import RegisterFrames from './RegisterFrames.class';

/**
 * Defines all non field elements of form and their placement on merchant site.
 */
export default class CommonFrames extends RegisterFrames {
  get merchantForm(): any {
    return document.getElementById(Selectors.MERCHANT_FORM_SELECTOR);
  }

  set requestTypes(requestTypes: string[]) {
    this._requestTypes = requestTypes;
  }

  get requestTypes(): string[] {
    return this._requestTypes;
  }

  public elementsToRegister: HTMLElement[];
  public elementsTargets: any;
  private notificationFrameMounted: HTMLElement;
  private controlFrameMounted: HTMLElement;
  private notificationFrame: Element;
  private controlFrame: Element;
  private messageBus: MessageBus;
  private submitOnSuccess: boolean;
  private submitOnError: boolean;
  private submitFields: string[];
  private gatewayUrl: string;
  private _requestTypes: string[];

  constructor(
    jwt: any,
    origin: any,
    componentIds: [],
    styles: IStyles,
    submitOnSuccess: boolean,
    submitOnError: boolean,
    submitFields: string[],
    gatewayUrl: string
  ) {
    super(jwt, origin, componentIds, styles);
    this.submitOnSuccess = submitOnSuccess;
    this.submitOnError = submitOnError;
    this.submitFields = submitFields;
    this.gatewayUrl = gatewayUrl;
    this.messageBus = new MessageBus(origin);
    this._onInit();
  }

  /**
   * Defines form elements for notifications and control frame
   */
  public setElementsFields() {
    const elements = [];
    if (this.shouldLoadNotificationFrame()) {
      elements.push(this.componentIds.notificationFrame);
    }
    elements.push(Selectors.MERCHANT_FORM_SELECTOR); // Control frame is always needed so just append to form
    return elements;
  }

  public _onInit() {
    this.initFormFields();
    this._setMerchantInputListeners();
    this._setTransactionCompleteListener();
    this.registerElements(this.elementsToRegister, this.elementsTargets);
  }
  /**
   * Inits necessary fields - notification and control frame
   */
  public initFormFields() {
    this.notificationFrame = new Element();
    this.controlFrame = new Element();
    if (this.shouldLoadNotificationFrame()) {
      this.notificationFrame.create(Selectors.NOTIFICATION_FRAME_COMPONENT_NAME, this.styles, this.params);
      this.notificationFrameMounted = this.notificationFrame.mount(Selectors.NOTIFICATION_FRAME_IFRAME, '-1');
      this.elementsToRegister.push(this.notificationFrameMounted);
    }
    this.controlFrame.create(Selectors.CONTROL_FRAME_COMPONENT_NAME, this.styles, {
      gatewayUrl: this.gatewayUrl,
      jwt: this.jwt,
      origin: this.origin
    });
    this.controlFrameMounted = this.controlFrame.mount(Selectors.CONTROL_FRAME_IFRAME, '-1');
    this.elementsToRegister.push(this.controlFrameMounted);
  }

  /**
   * Register fields in clients form
   * @param fields
   * @param targets
   */
  public registerElements(fields: HTMLElement[], targets: string[]) {
    targets.map((item, index) => {
      const itemToChange = document.getElementById(item);
      if (fields[index]) {
        itemToChange.appendChild(fields[index]);
      }
    });
  }

  private shouldLoadNotificationFrame() {
    return !(this.submitOnError && this.submitOnSuccess);
  }

  private onInput(event: Event) {
    const messageBusEvent = {
      data: DomMethods.parseMerchantForm(),
      type: MessageBus.EVENTS_PUBLIC.UPDATE_MERCHANT_FIELDS
    };
    this.messageBus.publishFromParent(messageBusEvent, Selectors.CONTROL_FRAME_IFRAME);
  }

  private _setMerchantInputListeners() {
    const els = DomMethods.getAllFormElements(this.merchantForm);
    for (const el of els) {
      el.addEventListener('input', this.onInput.bind(this));
    }
  }

  // TODO refactor with CardinalCommerce
  private _isCardEnrolledAndNotFrictionless(response: any) {
    return response.enrolled === 'Y' && response.acsurl !== undefined;
  }

  // TODO unittest
  private _isThreedComplete(data: any) {
    if (this.requestTypes[this.requestTypes.length - 1] === 'THREEDQUERY') {
      if (
        (!this._isCardEnrolledAndNotFrictionless(data) && data.requesttypedescription === 'THREEDQUERY') ||
        data.threedresponse
      ) {
        return true;
      }
    }
    return false;
  }

  // TODO unittest
  private isTransactionFinished(data: any) {
    if (['AUTH', 'CACHETOKENISE'].includes(data.requesttypedescription)) {
      // TODO can we end on anything else
      return true;
    } else if (this._isThreedComplete(data)) {
      return true;
    }
    return false;
  }

  private shouldSubmitForm(data: any) {
    return (
      (this.submitOnSuccess && data.errorcode === '0' && this.isTransactionFinished(data)) ||
      (this.submitOnError && data.errorcode !== '0')
    );
  }

  // TODO unittest
  private getSubmitFields(data: any) {
    let fields = this.submitFields;
    if (data.hasOwnProperty('jwt')) {
      fields = ['jwt'];
    }
    // TODO do we always want to push this on?
    if (data.hasOwnProperty('threedresponse')) {
      fields.push('threedresponse');
    }
    return fields;
  }

  private onTransactionComplete(data: any) {
    if (this.shouldSubmitForm(data)) {
      const form = this.merchantForm;
      DomMethods.addDataToForm(form, data, this.getSubmitFields(data));
      form.submit();
    }
  }

  private _setTransactionCompleteListener() {
    this.messageBus.subscribe(MessageBus.EVENTS_PUBLIC.TRANSACTION_COMPLETE, (data: any) => {
      this.onTransactionComplete(data);
    });
  }
}
