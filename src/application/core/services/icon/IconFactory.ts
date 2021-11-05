import { Service } from 'typedi';
import { IIconAttributes } from '../../models/IIconAttributes';
import { IconMap } from './IconMap';

@Service()
export class IconFactory {
  private attributes: IIconAttributes = {
    alt: '',
    ariaLabel: 'Credit card icon',
    class: 'st-card-icon',
    id: 'card-icon',
    src: '',
  };

  constructor(private url: IconMap) {}

  getIcon(name: string): HTMLImageElement {
    const icon = document.createElement('img');
    Object.keys(this.attributes).map((key: string) => {
      if (this.attributes[key]) {
        icon.setAttribute(key, this.attributes[key]);
      }
    });
    icon.setAttribute('src', this.url.getUrl(name));
    icon.setAttribute('alt', this.url.getUrl(name));
    return icon;
  }
}
