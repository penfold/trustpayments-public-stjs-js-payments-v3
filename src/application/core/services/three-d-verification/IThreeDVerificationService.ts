import { Observable } from 'rxjs';
import { IVerificationData } from './data/IVerificationData';
import { IVerificationResult } from './data/IVerificationResult';

export abstract class IThreeDVerificationService {
  abstract init(jwt: string): Observable<void>;
  abstract binLookup(pan: string): Observable<void>;
  abstract start(jwt: string): Observable<any>;
  abstract verify(data: IVerificationData): Observable<IVerificationResult>;
}
