import { Service } from 'typedi';
import { DomMethods } from '../../../../application/core/shared/dom-methods/DomMethods';
import { IClickToPayConfig } from '../../models/IClickToPayConfig';

@Service()
export class ClickToPayButtonService {
  insertClickToPayButton(config: IClickToPayConfig): Element {
    console.log(config);
    const { buttonPlacement = 'st-click-to-pay' } = config;

    return !this.isButtonInserted(buttonPlacement)
      ? DomMethods.appendChildStrictIntoDOM(buttonPlacement, this.createButton())
      : null;
  }

  protected createButton(): HTMLElement {
    return DomMethods.createHtmlElement.apply(this, [
      {
        src: 'https://sandbox-assets.secure.checkout.visa.com/wallet-services-web/xo/button.png?size=302&color=dark&animation=true&legacy=false&svg=true&orderedCardBrands=VISA%2CMASTERCARD%2CAMEX',
      },
      'img',
    ]);
  }

  private isButtonInserted(buttonPlacement: string): boolean {
    return document.getElementById(buttonPlacement) ? !!document.getElementById(buttonPlacement).querySelector('img') : false;
  }
}