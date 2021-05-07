import { Observable } from 'rxjs';
import { IThreeDInitResponse } from '../../models/IThreeDInitResponse';
import { ICard } from '../../models/ICard';
import { IMerchantData } from '../../models/IMerchantData';
import { IThreeDQueryResponse } from '../../models/IThreeDQueryResponse';

export abstract class IThreeDVerificationService<T> {
  abstract init(jsInitResponse: IThreeDInitResponse): Observable<T>;
  abstract binLookup(pan: string): Observable<void>;
  abstract start(
    jsInitResponse: IThreeDInitResponse,
    requestTypes: string[],
    card: ICard,
    merchantData: IMerchantData
  ): Observable<IThreeDQueryResponse>;
}
