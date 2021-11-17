import { Service } from 'typedi';
import { DomMethods } from '../../../shared/dom-methods/DomMethods';
import { VisaCheckoutButtonProps } from './VisaCheckoutButtonProps';
import { IVisaCheckoutButtonSettings } from './IVisaCheckoutButtonSettings';
import { IVisaCheckoutButtonProps } from './IVisaCheckoutButtonProps';

@Service()
export class VisaCheckoutButtonService {
  mount(target: string, settings: IVisaCheckoutButtonSettings, src: string): Element {
    return DomMethods.appendChildIntoDOM(target, this.create(src, settings));
  }

  private customize(src: string, settings: IVisaCheckoutButtonSettings): IVisaCheckoutButtonProps {
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

  private create(src: string, settings: IVisaCheckoutButtonSettings = {}): HTMLElement {
    return DomMethods.createHtmlElement.apply(this, [this.customize(src, settings), 'img']);
  }
}
