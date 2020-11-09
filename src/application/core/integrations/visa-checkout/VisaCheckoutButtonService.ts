import { Service } from 'typedi';
import { VisaButtonProps } from './VisaButtonProps';
import { DomMethods } from '../../shared/dom-methods/DomMethods';
import { IVisaButtonSettings } from './IVisaButtonSettings';
import { IVisaButtonProps } from './IVisaButtonProps';

@Service()
export class VisaCheckoutButtonService {
  mount(target: string, settings: IVisaButtonSettings, src: string): Element {
    return DomMethods.appendChildIntoDOM(target, this._create(settings, src));
  }

  customize(settings: IVisaButtonSettings, src: string): IVisaButtonProps {
    const url = new URL(src);
    const props: IVisaButtonProps = VisaButtonProps;
    Object.keys(settings).forEach((item: any) => {
      // @ts-ignore
      if (settings[item]) {
        // @ts-ignore
        url.searchParams.append(`${item}`, settings[item]);
      }
    });
    props.src = url.href;
    return props;
  }

  private _create(settings: IVisaButtonSettings, src: string): HTMLElement {
    return DomMethods.createHtmlElement.apply(this, [this.customize(settings, src), 'img']);
  }
}
