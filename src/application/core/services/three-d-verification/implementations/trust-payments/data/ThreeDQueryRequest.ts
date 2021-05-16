import { IStRequest } from '../../../../../models/IStRequest';
import { IMerchantData } from '../../../../../models/IMerchantData';
import { ICard } from '../../../../../models/ICard';
import { IBrowserData } from './IBrowserData';

export class ThreeDQueryRequest implements IStRequest {
  [index: string]: any;

  constructor(card: ICard, merchantData: IMerchantData, browserData?: IBrowserData) {
    Object.assign(this, card);
    Object.assign(this, merchantData);

    if (browserData) {
      Object.assign(this, browserData);
    }
  }
}
