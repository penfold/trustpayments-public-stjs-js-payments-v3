import { IConfig } from '../../../../../shared/model/config/IConfig';
import { ConfigReducer } from './ConfigReducer';
import { PUBLIC_EVENTS } from '../../../models/constants/EventTypes';
import { IApplicationFrameState } from '../../state/IApplicationFrameState';

describe('ConfigReducer', () => {
  const reducer = new ConfigReducer();

  it('returns given state by default', () => {
    const initialState: IApplicationFrameState = { config: null, storage: {} };

    expect(reducer.reduce(initialState, { type: 'FOO' })).toBe(initialState);
  });

  it('handles UPDATE_CONFIG action', () => {
    const initialState: IApplicationFrameState = { config: null, storage: {} };
    const config = ({ FOO: 'BAR' } as unknown) as IConfig;
    const result = reducer.reduce(initialState, { type: PUBLIC_EVENTS.CONFIG_CHANGED, data: config });

    expect(result).toEqual({ config, storage: {} });
  });

  it('handles CLEAR_CONFIG action', () => {
    const initialState: IApplicationFrameState = {
      config: ({ FOO: 'BAR' } as unknown) as IConfig,
      storage: {}
    };
    const result = reducer.reduce(initialState, { type: PUBLIC_EVENTS.CONFIG_CLEARED });

    expect(result).toEqual({ config: null, storage: {} });
  });
});
