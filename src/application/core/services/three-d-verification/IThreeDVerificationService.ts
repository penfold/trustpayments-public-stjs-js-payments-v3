import { Observable } from 'rxjs';
import { IThreeDSecure3dsMethod } from '../../../../client/integrations/three-d-secure/IThreeDSecure3dsMethod';
import { IVerificationData } from './data/IVerificationData';
import { IVerificationResult } from './data/IVerificationResult';

export abstract class IThreeDVerificationService<T, C> {
  abstract init(jwt: string): Observable<T>;
  abstract binLookup(pan: string): Observable<C>;
  abstract start(jwt: string): Observable<any>;
  abstract verify(data: IVerificationData): Observable<IVerificationResult>;
}
