import { DomMethods } from '../../../shared/dom-methods/DomMethods';
import { ApplePayButtonService } from './ApplePayButtonService';

export class ApplePayButtonServiceMock extends ApplePayButtonService {
  createButton(label: string, style: string, locale: string): HTMLElement {
    const buttonImg: HTMLElement = DomMethods.createHtmlElement.apply(this, [
      { src: './img/apple-pay.png', id: 'st-apple-pay' },
      'img'
    ]);
    const buttonLink: HTMLElement = DomMethods.createHtmlElement.apply(this, [
      {
        style: `-webkit-appearance: -apple-pay-button;
                -apple-pay-button-type: plain;
                -apple-pay-button-style: black;pointer-events: auto;cursor: pointer;display: flex;role: button;`,
        lang: 'en_GB'
      },
      'a'
    ]);
    buttonLink.appendChild(buttonImg);

    return buttonLink;
  }
}
