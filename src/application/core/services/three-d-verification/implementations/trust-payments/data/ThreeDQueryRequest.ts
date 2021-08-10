import { TERM_URL } from '../../../../../models/constants/RequestData';
import { IStRequest } from '../../../../../models/IStRequest';
import { IMerchantData } from '../../../../../models/IMerchantData';
import { ICard } from '../../../../../models/ICard';
import { IBrowserData } from './IBrowserData';

export class ThreeDQueryRequest implements IStRequest {
  readonly termurl = TERM_URL; // @TODO: This is mocked value treated as a placeholder because backend requires it.

  [index: string]: string | string[];

  constructor(card: ICard, merchantData: IMerchantData, browserData?: IBrowserData) {
    Object.assign(this, card);
    Object.assign(this, merchantData);

    if (browserData) {
      Object.assign(this, browserData);
    }
  }
}
