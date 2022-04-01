import { Service } from 'typedi';
import { IReducer } from '../../IReducer';
import { IApplicationFrameState } from '../../state/IApplicationFrameState';
import { IMessageBusEvent } from '../../../models/IMessageBusEvent';
import { PUBLIC_EVENTS } from '../../../models/constants/EventTypes';
import { ReducerToken } from '../../../../../shared/dependency-injection/InjectionTokens';

@Service({ id: ReducerToken, multiple: true })
export class JwtReducer implements IReducer<IApplicationFrameState> {
  reduce(state: IApplicationFrameState, action: IMessageBusEvent<string>): IApplicationFrameState {
    switch (action.type) {
      case PUBLIC_EVENTS.TOKENIZED_JWT_UPDATED: {
        return {
          ...state,
          tokenizedJwt: action.data,
        };
      }
      case PUBLIC_EVENTS.JWT_UPDATED: {
        return {
          ...state,
          jwt: action.data,
          originalJwt: action.data,
        };
      }
      case PUBLIC_EVENTS.JWT_REPLACED: {
        return { ...state, jwt: action.data };
      }
      case PUBLIC_EVENTS.JWT_RESET: {
        return { ...state, jwt: state.originalJwt };
      }
      case PUBLIC_EVENTS.DESTROY: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { jwt, originalJwt, ...newState } = state;

        return newState;
      }
      default: {
        return state;
      }
    }
  }
}
