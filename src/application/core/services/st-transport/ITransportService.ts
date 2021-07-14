import { Observable } from 'rxjs';
import { Service } from 'typedi';
import { IStRequest } from '../../models/IStRequest';
import { IJwtResponse } from '../st-codec/interfaces/IJwtResponse';
import { IRequestTypeResponse } from '../st-codec/interfaces/IRequestTypeResponse';

@Service()
export abstract class ITransportService {
  abstract sendRequest(request: IStRequest, gatewayUrl?: string): Observable<IRequestTypeResponse & IJwtResponse>
}