import { Service } from 'typedi';
import { PUBLIC_EVENTS } from '../../../models/constants/EventTypes';
import { IReducer } from '../../IReducer';
import { IMessageBusEvent } from '../../../models/IMessageBusEvent';
import { ReducerToken } from '../../../../../shared/dependency-injection/InjectionTokens';
import { IApplicationFrameState } from '../../state/IApplicationFrameState';
import { IParentFrameState } from '../../state/IParentFrameState';

export type CommonState = IApplicationFrameState | IParentFrameState;

@Service({ id: ReducerToken, multiple: true })
export class ApplePayReducer implements IReducer<CommonState> {
  reduce(state: CommonState, action: IMessageBusEvent): CommonState {
    if (action.type === PUBLIC_EVENTS.APPLE_PAY_CONFIG_MOCK) {
      const applePay = {
        ...state.applePay,
        [action.data.key]: action.data.value
      };

      return { ...state, applePay };
    }

    return state;
  }
}
