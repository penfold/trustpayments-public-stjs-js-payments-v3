import { IThreeDInitResponse } from '../../models/IThreeDInitResponse';
import { Observable } from 'rxjs';

export interface IRequestProcessingOptions {
  jsInitResponse: IThreeDInitResponse | null,
  merchantUrl?: string,
  timer?: Observable<unknown>,
}
