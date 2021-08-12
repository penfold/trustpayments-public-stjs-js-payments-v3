import { DomMethods } from '../../../shared/dom-methods/DomMethods';
import { ApplePayButtonService } from './ApplePayButtonService';

export class ApplePayButtonServiceMock extends ApplePayButtonService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createButton(label: string, style: string, locale: string): HTMLElement {
    return DomMethods.createHtmlElement.apply(this, [{ src: './img/apple-pay.png', id: 'st-apple-pay' }, 'img']);
  }
}
