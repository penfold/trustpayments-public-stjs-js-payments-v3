import { Service } from 'typedi';
import { DomMethods } from '../../../shared/dom-methods/DomMethods';
import { APPLE_PAY_BUTTON_ID } from '../ApplePayButtonProperties';

@Service()
export class ApplePayButtonService {
  insertButton(targetId: string, label: string, style: string, locale: string): Element {
    return DomMethods.appendChildIntoDOM(targetId, this._createButton(label, style, locale));
  }

  handleEvent(callback: () => void, event: string): void {
    console.error('handler:', event);
    const button = document.getElementById(APPLE_PAY_BUTTON_ID);
    const handler = () => {
      callback();
      button.removeEventListener(event, handler);
    };

    if (button) {
      button.addEventListener(event, handler);
    }
  }

  private _createButton(label: string, style: string, locale: string): HTMLElement {
    return DomMethods.createHtmlElement.apply(this, [
      {
        style: `-webkit-appearance: -apple-pay-button;
                -apple-pay-button-type: ${label};
                -apple-pay-button-style: ${style};pointer-events: auto;cursor: pointer;display: flex;role: button;`,
        lang: locale
      },
      'a'
    ]);
  }
}
