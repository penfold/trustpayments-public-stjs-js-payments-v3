import { Service } from 'typedi';
import { IReducer } from '../../IReducer';
import { IMessageBusEvent } from '../../../models/IMessageBusEvent';
import { PUBLIC_EVENTS } from '../../../models/constants/EventTypes';
import { ReducerToken } from '../../../../../shared/dependency-injection/InjectionTokens';
import { ISentryMessageEvent } from '../../../../../shared/services/sentry/models/ISentryData';
import { IParentFrameState } from '../../state/IParentFrameState';

@Service({ id: ReducerToken, multiple: true })
export class SentryReducer implements IReducer<IParentFrameState> {
  reduce(state: IParentFrameState, action: IMessageBusEvent<ISentryMessageEvent>): IParentFrameState {
    if (action.type === PUBLIC_EVENTS.SENTRY_DATA_UPDATED) {
      return {
        ...state,
        sentryData: { ...state?.sentryData, [action.data.name]: action.data.value },
      }
    }
      return state
    }
  }
