import { Service } from 'typedi';
import { IReducer } from '../../IReducer';
import { IApplicationFrameState } from '../../state/IApplicationFrameState';
import { IParentFrameState } from '../../state/IParentFrameState';
import { IMessageBusEvent } from '../../../models/IMessageBusEvent';
import { PUBLIC_EVENTS } from '../../../models/constants/EventTypes';
import { ReducerToken } from '../../../../../shared/dependency-injection/InjectionTokens';

type CommonState = IApplicationFrameState | IParentFrameState;

@Service({ id: ReducerToken, multiple: true })
export class StorageReducer implements IReducer<CommonState> {
  reduce(state: CommonState, action: IMessageBusEvent<{ key: string; value: unknown; }>): CommonState {
    if (action.type === PUBLIC_EVENTS.STORAGE_SET_ITEM) {
      const storage = { ...state.storage, [action.data.key]: action.data.value };
      return { ...state, storage };
    }

    return state;
  }
}
