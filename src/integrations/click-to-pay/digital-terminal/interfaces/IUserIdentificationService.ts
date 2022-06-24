import { Observable } from 'rxjs';
import { SrcAggregate } from '../SrcAggregate';
import { ICompleteIdValidationResponse } from '../ISrc';
import { IIdentificationData } from './IIdentificationData';

export interface IUserIdentificationService {
  identifyUser(srcAggregate: SrcAggregate, identificationData?: IIdentificationData): Observable<ICompleteIdValidationResponse>;
}
