import { IMessageBusEvent } from '../../../models/IMessageBusEvent';
import { PUBLIC_EVENTS } from '../../../models/constants/EventTypes';
import { IApplicationFrameState } from '../../state/IApplicationFrameState';
import { ApplePayReducer } from './ApplePayReducer';

describe('ApplePayReducer', () => {
  const storageReducer = new ApplePayReducer();
  const initialState: IApplicationFrameState = {
    config: null,
    storage: {},
    applePay: {},
  };

  it('returns given state by default', () => {
    expect(storageReducer.reduce(initialState, { type: 'FOO' })).toBe(initialState);
  });

  it('handles config set action', () => {
    const action: IMessageBusEvent = {
      type: PUBLIC_EVENTS.APPLE_PAY_CONFIG_MOCK,
      data: {
        foo: 'bar',
      },
    };
    const result = storageReducer.reduce(initialState, action);

    expect(result).toEqual({
      config: null,
      storage: {},
      applePay: {
        config: {
          foo: 'bar',
        },
      },
    });
  });
});
