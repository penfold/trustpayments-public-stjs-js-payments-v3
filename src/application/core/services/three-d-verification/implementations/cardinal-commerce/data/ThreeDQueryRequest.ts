import { IStRequest } from '../../../../../models/IStRequest';
import { IMerchantData } from '../../../../../models/IMerchantData';
import { ICard } from '../../../../../models/ICard';
import { TERM_URL } from '../../../../../models/constants/RequestData';

export class ThreeDQueryRequest implements IStRequest {
  readonly termurl = TERM_URL; // @TODO: This is mocked value treated as a placeholder bacause backend requires it.
  readonly cachetoken: string;

  [index: string]: string | string[];

  constructor(cacheToken: string, card: ICard, merchantData: IMerchantData) {
    this.cachetoken = cacheToken;
    Object.assign(this, card);
    Object.assign(this, merchantData);
  }
}
