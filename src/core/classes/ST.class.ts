/***
 * Establishes connection with ST, defines client.
 */
import { iframesEndpoints } from '../imports/iframe';

class ST {
  private static _iframeCreditCardId: string = 'st-card-number-iframe';
  private static _iframeSecurityCodeId: string = 'st-security-code-iframe';
  private static _iframeExpirationDateId: string = 'st-expiration-date-iframe';

  constructor() {
    this.submitListener();
  }

  /**
   * Listens to submit and gives iframes a sign that post has been done
   */
  public submitListener = () => {
    document.addEventListener('DOMContentLoaded', () => {
      document.addEventListener('submit', event => {
        event.preventDefault();
        const creditCardIframe = document.getElementById(
          ST._iframeCreditCardId
        ) as HTMLIFrameElement;
        const securityCodeIframe = document.getElementById(
          ST._iframeSecurityCodeId
        ) as HTMLIFrameElement;
        const expirationDateIframe = document.getElementById(
          ST._iframeExpirationDateId
        ) as HTMLIFrameElement;
        const creditCardContentWindow = creditCardIframe.contentWindow;
        const securityCodeContentWindow = securityCodeIframe.contentWindow;
        const expirationDateContentWindow = expirationDateIframe.contentWindow;
        creditCardContentWindow.postMessage(
          'message',
          iframesEndpoints.cardNumber
        );
        securityCodeContentWindow.postMessage(
          'message',
          iframesEndpoints.securityCode
        );
        expirationDateContentWindow.postMessage(
          'message',
          iframesEndpoints.expirationDate
        );
      });
    });
  };

  /**
   * Register fields in clients form
   * @param fields
   * @param targets
   */
  public registerElements(fields: HTMLElement[], targets: string[]) {
    targets.map((item, index) => {
      const itemToChange = document.getElementById(item);
      itemToChange.appendChild(fields[index]);
    });
  }
}

export default ST;
