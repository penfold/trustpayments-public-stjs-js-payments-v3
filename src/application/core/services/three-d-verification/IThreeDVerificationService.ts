import { Observable } from 'rxjs';
import { IThreeDInitResponse } from '../../models/IThreeDInitResponse';
import { IVerificationData } from './data/IVerificationData';
import { IVerificationResult } from './data/IVerificationResult';

export abstract class IThreeDVerificationService<T> {
  abstract init(jsInitResponse: IThreeDInitResponse): Observable<T>;
  abstract binLookup(pan: string): Observable<void>;
  abstract start(jwt: string): Observable<void>;
  abstract verify(data: IVerificationData): Observable<IVerificationResult>;
}
