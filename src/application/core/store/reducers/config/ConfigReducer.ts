import { IReducer } from '../../IReducer';
import { IApplicationFrameState } from '../../state/IApplicationFrameState';
import { IParentFrameState } from '../../state/IParentFrameState';
import { IMessageBusEvent } from '../../../models/IMessageBusEvent';
import { PUBLIC_EVENTS } from '../../../models/constants/EventTypes';
import { Service } from 'typedi';
import { ReducerToken } from '../../../../../shared/dependency-injection/InjectionTokens';

type CommonState = IApplicationFrameState | IParentFrameState;

@Service({ id: ReducerToken, multiple: true })
export class ConfigReducer implements IReducer<CommonState> {
  reduce(state: CommonState, action: IMessageBusEvent): CommonState {
    switch (action.type) {
      case PUBLIC_EVENTS.CONFIG_CHANGED:
        return { ...state, config: action.data };
      case PUBLIC_EVENTS.CONFIG_CLEARED:
        return { ...state, config: null };
    }

    return state;
  }
}
