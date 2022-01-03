import { PUBLIC_EVENTS } from '../../../models/constants/EventTypes';
import { IApplicationFrameState } from '../../state/IApplicationFrameState';
import { IParentFrameState } from '../../state/IParentFrameState';
import { InitialConfigReducer } from './InitialConfigReducer';

describe('InitialConfigReducer', () => {
  const reducer = new InitialConfigReducer();

  it('returns given state by default', () => {
    const initialState: IApplicationFrameState & IParentFrameState = { storage: {} };
    expect(reducer.reduce(initialState, { type: 'OTHER_ACTION' })).toBe(initialState);
  });

  it('handles PARTIAL_CONFIG_SET action', () => {
    const initialState: IApplicationFrameState & IParentFrameState = { storage: {} };
    const result = reducer.reduce(initialState, {
      type: PUBLIC_EVENTS.PARTIAL_CONFIG_SET,
      data: {
        name: 'GooglePay',
        config: {},
      },
    });

    expect(result).toEqual({ storage: {}, initialConfig: { GooglePay: {} } });
  });
});
