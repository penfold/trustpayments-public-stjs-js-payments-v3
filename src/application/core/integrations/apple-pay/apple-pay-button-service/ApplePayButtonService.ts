import { Service } from 'typedi';
import { DomMethods } from '../../../shared/dom-methods/DomMethods';

@Service()
export class ApplePayButtonService {
  protected createButton(label: string, style: string, locale: string): HTMLElement {
    return DomMethods.createHtmlElement.apply(this, [
      {
        style: `-webkit-appearance: -apple-pay-button;
                -apple-pay-button-type: ${label ? label : 'plain'};
                -apple-pay-button-style: ${style ? style : 'black'};pointer-events: auto;cursor: pointer;display: flex;role: button;`,
        lang: locale,
      },
      'a',
    ]);
  }

  insertButton(targetId: string, label: string, style: string, locale: string): Element {
    return !this.isButtonInserted(targetId)
      ? DomMethods.appendChildStrictIntoDOM(targetId, this.createButton(label, style, locale))
      : null;
  }

  private isButtonInserted(targetId: string): boolean {
    return document.getElementById(targetId) ? !!document.getElementById(targetId).querySelector('a') : false;
  }
}
