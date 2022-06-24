import { Service } from 'typedi';
import { IReducer } from '../../IReducer';
import { IMessageBusEvent } from '../../../models/IMessageBusEvent';
import { ReducerToken } from '../../../../../shared/dependency-injection/InjectionTokens';
import { IApplicationFrameState } from '../../state/IApplicationFrameState';
import { IParentFrameState } from '../../state/IParentFrameState';
import { PUBLIC_EVENTS } from '../../../models/constants/EventTypes';

export type CommonState = IApplicationFrameState & IParentFrameState;

@Service({ id: ReducerToken, multiple: true })
export class InitialConfigReducer implements IReducer<CommonState> {
  reduce(state: CommonState, action: IMessageBusEvent<any>): CommonState {
    if (action.type === PUBLIC_EVENTS.PARTIAL_CONFIG_SET) {
      return {
        ...state,
        initialConfig: {
          ...state.initialConfig,
          [action.data.name]: action.data.config,
        },
      };
    }
    return state;
  }
}
