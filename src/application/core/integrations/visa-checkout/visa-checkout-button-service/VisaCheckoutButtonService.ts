import { Service } from 'typedi';
import { VisaCheckoutButtonProps } from './VisaCheckoutButtonProps';
import { DomMethods } from '../../../shared/dom-methods/DomMethods';
import { IVisaCheckoutButtonSettings } from './IVisaCheckoutButtonSettings';
import { IVisaCheckoutButtonProps } from './IVisaCheckoutButtonProps';

@Service()
export class VisaCheckoutButtonService {
  mount(target: string, settings: IVisaCheckoutButtonSettings, src: string): Element {
    return DomMethods.appendChildIntoDOM(target, this._create(settings, src));
  }

  customize(settings: IVisaCheckoutButtonSettings, src: string): IVisaCheckoutButtonProps {
    const url = new URL(src);
    const props: IVisaCheckoutButtonProps = VisaCheckoutButtonProps;
    Object.keys(settings).forEach((item: keyof IVisaCheckoutButtonSettings) => {
      if (settings[item]) {
        url.searchParams.append(item, String(settings[item]));
      }
    });
    props.src = url.href;
    return props;
  }

  private _create(settings: IVisaCheckoutButtonSettings, src: string): HTMLElement {
    return DomMethods.createHtmlElement.apply(this, [this.customize(settings, src), 'img']);
  }
}
