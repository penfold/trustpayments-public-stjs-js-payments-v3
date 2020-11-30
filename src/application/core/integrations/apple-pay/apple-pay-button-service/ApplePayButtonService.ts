import { DomMethods } from '../../../shared/dom-methods/DomMethods';
import { Service } from 'typedi';
import { APPLE_PAY_BUTTON_ID } from '../ApplePayButtonProperties';

@Service()
export class ApplePayButtonService {
  insertButton(placement: string, buttonText: string, buttonStyle: string, locale: string): Element {
    return DomMethods.appendChildIntoDOM(placement, this._createButton(buttonText, buttonStyle, locale));
  }

  applePayButtonClickHandler(callback: () => void) {
    const button = document.getElementById(APPLE_PAY_BUTTON_ID);
    const handler = () => {
      callback();
      button.removeEventListener('click', handler);
    };

    if (button) {
      button.addEventListener('click', handler);
    }
  }

  private _createButton(buttonText: string, buttonStyle: string, locale: string): HTMLElement {
    return DomMethods.createHtmlElement.apply(this, [
      {
        style: `-webkit-appearance: -apple-pay-button;
                -apple-pay-button-type: ${buttonText};
                -apple-pay-button-style: ${buttonStyle};pointer-events: auto;cursor: pointer;display: flex;role: button;`,
        lang: locale
      },
      'a'
    ]);
  }
}
