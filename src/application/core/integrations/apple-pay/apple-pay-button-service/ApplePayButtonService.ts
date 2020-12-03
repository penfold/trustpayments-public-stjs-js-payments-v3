import { Service } from 'typedi';
import { DomMethods } from '../../../shared/dom-methods/DomMethods';

@Service()
export class ApplePayButtonService {
  insertButton(targetId: string, label: string, style: string, locale: string): Element {
    return DomMethods.appendChildIntoDOM(targetId, this._createButton(label, style, locale));
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
