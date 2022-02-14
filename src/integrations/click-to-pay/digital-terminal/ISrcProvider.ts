import { Observable } from 'rxjs';
import { ISrc } from './ISrc';
import { SrcName } from './SrcName';

export interface ISrcProvider {
  getSrcName(): SrcName;
  getSrc(): Observable<ISrc>;
}
