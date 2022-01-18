import { Service } from 'typedi';
import { DomMethods } from '../../../../application/core/shared/dom-methods/DomMethods';
import { IClickToPayConfig } from '../../models/IClickToPayConfig';
import { environment } from '../../../../environments/environment';

@Service()
export class ClickToPayButtonService {
  private static readonly DEFAULT_BUTTON_PLACEMENT = 'st-click-to-pay';

  insertClickToPayButton(config: IClickToPayConfig): Element {
    const { buttonPlacement = ClickToPayButtonService.DEFAULT_BUTTON_PLACEMENT } = config;

    return !this.isButtonInserted(buttonPlacement)
      ? DomMethods.appendChildStrictIntoDOM(buttonPlacement, this.createButton())
      : document.getElementById(buttonPlacement);
  }

  protected createButton(): HTMLElement {
    return DomMethods.createHtmlElement.apply(this, [
      {
        src: environment.CLICK_TO_PAY.BUTTON_URL,
      },
      'img',
    ]);
  }

  private isButtonInserted(buttonPlacement: string): boolean {
    return document.getElementById(buttonPlacement) ? !!document.getElementById(buttonPlacement).querySelector('img') : false;
  }
}