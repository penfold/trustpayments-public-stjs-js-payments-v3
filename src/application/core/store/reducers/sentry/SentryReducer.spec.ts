import { IMessageBusEvent } from '../../../models/IMessageBusEvent';
import { PUBLIC_EVENTS } from '../../../models/constants/EventTypes';
import { IParentFrameState } from '../../state/IParentFrameState';
import { ISentryMessageEvent, SentryDataFields } from '../../../../../shared/services/sentry/models/ISentryData';
import { SentryReducer } from './SentryReducer';

const initialState: IParentFrameState = {
  config: {},
  storage: {},
  applePay: {},
};
const sut = new SentryReducer();

describe('SentryReducer', () => {
  it('should return initial state by default', () => {
    const action: IMessageBusEvent<ISentryMessageEvent> = {
      type: 'FOO',
      data: {
        name: SentryDataFields.CurrentResponseId,
        value: 'bar',
      },
    };
    expect(sut.reduce(initialState, action)).toBe(initialState);
  });

  it('should update state after receiving a proper event', () => {
    const action: IMessageBusEvent<ISentryMessageEvent> = {
      type: PUBLIC_EVENTS.SENTRY_DATA_UPDATED,
      data: {
        name: SentryDataFields.CurrentResponseId,
        value: 'bar',
      },
    };
    const result = sut.reduce(initialState, action);

    expect(result).toEqual({
      ...initialState,
      sentryData: { ...initialState.sentryData, [action.data.name]: action.data.value },
    });
  })
})
