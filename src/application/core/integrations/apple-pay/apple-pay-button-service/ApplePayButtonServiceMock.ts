import { DomMethods } from '../../../shared/dom-methods/DomMethods';
import { ApplePayButtonService } from './ApplePayButtonService';

export class ApplePayButtonServiceMock extends ApplePayButtonService {
  createButton(label: string, style: string, locale: string): HTMLElement {
    return DomMethods.createHtmlElement.apply(this, [{ src: './img/apple-pay.png', id: 'st-apple-pay' }, 'img']);
  }
}
