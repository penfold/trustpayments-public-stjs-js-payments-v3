import { Service } from 'typedi';
import { IAllowedStyles } from '../../models/IAllowedStyles';
import { IParams } from '../../models/IParams';
import { frameAllowedStyles } from './frame-const';

@Service()
export class Frame {
  getAllowedParams(): string[] {
    return ['locale', 'origin'];
  }

  getAllowedStyles(): IAllowedStyles {
    return frameAllowedStyles;
  }

  parseUrl(additionalParams?: string[]): IParams {
    const parsedUrl = new URL(window.location.href);
    const allowedParams = this.getAllowedParams().concat(additionalParams);
    const params: IParams = { styles: [] };

    parsedUrl.searchParams.forEach((value: string, param: string) => {
      if (allowedParams.includes(param)) {
        params[param] = value;
      } else {
        params.styles.push({ [param]: value });
      }
    });

    return params;
  }
}
