import VisaCheckout from './classes/VisaCheckout';
import Element from './Element';
import { apmsNames } from './imports/apms';
import CardinalCommerce from './classes/CardinalCommerce';
import { GATEWAY_URL } from './imports/cardinalSettings';

/***
 * Establishes connection with ST, defines client.
 */
export default class ST {
  public jwt: string;
  public sitereference: string;
  public style: object;
  public errorContainerId: string;
  public payments: object[];
  public fieldsIds: any;

  public static cardNumberComponent = '/card-number.html';
  public static expirationDateComponent = '/expiration-date.html';
  public static securityCodeComponent = '/security-code.html';
  public static controlFrameComponent = '/control-frame.html';

  /**
   * Register fields in clients form
   * @param fields
   * @param targets
   */
  public static registerElements(fields: HTMLElement[], targets: string[]) {
    targets.map((item, index) => {
      const itemToChange = document.getElementById(item);
      itemToChange.appendChild(fields[index]);
    });
  }

  private static _iframeCreditCardId: string = 'st-card-number-iframe';
  private static _iframeSecurityCodeId: string = 'st-security-code-iframe';
  private static _iframeExpirationDateId: string = 'st-expiration-date-iframe';

  constructor(
    style: object,
    errorContainerId: string,
    jwt: string,
    fieldsIds: any,
    sitereference: string,
    payments: object[]
  ) {
    const gatewayUrl = GATEWAY_URL;
    this.style = style;
    this.payments = payments;
    this.sitereference = sitereference;
    this.fieldsIds = fieldsIds;
    this.errorContainerId = errorContainerId;

    const cardNumber = new Element();
    const securityCode = new Element();
    const expirationDate = new Element();
    const notificationFrame = new Element();

    new CardinalCommerce(jwt, sitereference, gatewayUrl);

    cardNumber.create('cardNumber');
    const cardNumberMounted = cardNumber.mount('st-card-number-iframe');

    securityCode.create('securityCode');
    const securityCodeMounted = securityCode.mount('st-security-code-iframe');

    expirationDate.create('expirationDate');
    const expirationDateMounted = expirationDate.mount('st-expiration-date-iframe');

    notificationFrame.create('notificationFrame');
    const notificationFrameMounted = notificationFrame.mount('st-notification-frame-iframe');

    ST.registerElements(
      [cardNumberMounted, securityCodeMounted, expirationDateMounted, notificationFrameMounted],
      [this.fieldsIds.cardNumber, this.fieldsIds.securityCode, this.fieldsIds.expirationDate, this.errorContainerId]
    );

    if (this._getAPMConfig(apmsNames.visaCheckout)) {
      const visa = new VisaCheckout(this._getAPMConfig(apmsNames.visaCheckout));
    }
  }

  /**
   * Gets APM config according to given apmName
   * @param apmName - name of payment
   * @private
   */
  private _getAPMConfig(apmName: string) {
    return Object.values(this.payments).find((item: { name: string }) => item.name === apmName);
  }
}
