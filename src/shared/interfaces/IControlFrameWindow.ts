import { BehaviorSubject, Observable } from 'rxjs';
import { IMessageBusEvent } from '../../application/core/models/IMessageBusEvent';
import { IApplicationFrameState } from '../../application/core/store/state/IApplicationFrameState';

export default interface IControlFrameWindow extends Window {
  stStore?: BehaviorSubject<IApplicationFrameState>;
  stMessages?: Observable<IMessageBusEvent>;
}
