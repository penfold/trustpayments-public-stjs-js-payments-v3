import { Observable } from 'rxjs';
import { IThreeDSecure3dsMethod } from '../../../../client/integrations/three-d-secure/IThreeDSecure3dsMethod';
import { IVerificationData } from './data/IVerificationData';
import { IVerificationResult } from './data/IVerificationResult';

export abstract class IThreeDVerificationService {
  abstract init(jwt: string): Observable<void>;
  abstract binLookup(pan: string, threeDSmethod?: IThreeDSecure3dsMethod): Observable<void>;
  abstract start(jwt: string, threeDSmethod?: IThreeDSecure3dsMethod): Observable<any>;
  abstract verify(data: IVerificationData): Observable<IVerificationResult>;
}
