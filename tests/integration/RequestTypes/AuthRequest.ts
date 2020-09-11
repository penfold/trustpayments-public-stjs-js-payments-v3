import { ICard } from '../../../src/application/core/models/ICard';
import { IMerchantData } from '../../../src/application/core/models/IMerchantData';
import { IStRequest } from '../../../src/application/core/models/IStRequest';

export class AuthRequest implements IStRequest {
  requesttypedescriptions: string[];
  card: ICard;
  merchantData: IMerchantData;
  additionalData: any;

  [key: string]: any;

  constructor(requestTypes: string[], card: ICard, merchantData?: IMerchantData, additionalData?: any) {
    this.requesttypedescriptions = requestTypes;
    Object.assign(this, card);
    Object.assign(this, merchantData);
    Object.assign(this, additionalData);
  }
}
