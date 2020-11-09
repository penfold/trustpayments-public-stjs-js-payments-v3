import { Service } from 'typedi';
import { VisaButtonProps } from '../../models/constants/visa-checkout/VisaButtonProps';
import { DomMethods } from '../../shared/dom-methods/DomMethods';
import { IVisaButtonSettings } from '../../models/visa-checkout/IVisaButtonSettings';

@Service()
export class VisaCheckoutButtonService {
  private _settings: IVisaButtonSettings;
  private _src: string;

  mount(target: string, settings: IVisaButtonSettings, src: string): Element {
    return DomMethods.appendChildIntoDOM(target, this._create(settings, src));
  }

  customize(settings: IVisaButtonSettings, src: string): string {
    const url = new URL(src);
    Object.keys(settings).forEach((item: any) => {
      // @ts-ignore
      if (settings[item]) {
        // @ts-ignore
        url.searchParams.append(`${item}`, settings[item]);
      }
    });
    VisaButtonProps.src = url.href;
    return url.href;
  }

  private _create(settings: IVisaButtonSettings, src: string): HTMLElement {
    return DomMethods.createHtmlElement.apply(this, [VisaButtonProps, 'img']);
  }
}
