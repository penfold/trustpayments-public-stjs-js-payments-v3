import { ICard } from '../../../src/application/core/models/ICard';
import { IMerchantData } from '../../../src/application/core/models/IMerchantData';
import { IStRequest } from '../../../src/application/core/models/IStRequest';

export class AuthRequest implements IStRequest {
  readonly requesttypedescriptions: string[];
  readonly card: ICard;
  readonly merchantData: IMerchantData;
  readonly additionalData: any;

  constructor(requestTypes: string[], card: ICard, merchantData?: IMerchantData, additionalData?: any) {
    this.requesttypedescriptions = requestTypes;
    Object.assign(this, card);
    Object.assign(this, merchantData);
    Object.assign(this, additionalData);
  }
}
