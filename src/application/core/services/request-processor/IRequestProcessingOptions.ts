import { Observable } from 'rxjs';
import { IThreeDInitResponse } from '../../models/IThreeDInitResponse';

export interface IRequestProcessingOptions {
  jsInitResponse: IThreeDInitResponse | null,
  merchantUrl?: string,
  timer?: Observable<unknown>,
}
