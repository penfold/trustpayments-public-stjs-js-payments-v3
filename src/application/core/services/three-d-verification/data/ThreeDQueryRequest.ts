import { IStRequest } from '../../../models/IStRequest';
import { IMerchantData } from '../../../models/IMerchantData';
import { ICard } from '../../../models/ICard';

export class ThreeDQueryRequest implements IStRequest {
  readonly termurl = 'https://termurl.com'; // TODO this shouldn't be needed but currently the backend needs this
  readonly cachetoken: string;
  [index: string]: any;

  constructor(cacheToken: string, card: ICard, merchantData: IMerchantData) {
    this.cachetoken = cacheToken;
    Object.assign(this, card);
    Object.assign(this, merchantData);
  }
}
