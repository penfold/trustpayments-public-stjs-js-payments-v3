import { StorageReducer } from './StorageReducer';
import { IMessageBusEvent } from '../../../models/IMessageBusEvent';
import { PUBLIC_EVENTS } from '../../../models/constants/EventTypes';
import { IApplicationFrameState } from '../../state/IApplicationFrameState';

describe('StorageReducer', () => {
  const storageReducer = new StorageReducer();
  const initialState: IApplicationFrameState = { config: null, storage: {} };

  it('returns given state by default', () => {
    expect(storageReducer.reduce(initialState, { type: 'FOO' })).toBe(initialState);
  });

  it('handles SET_ITEM action', () => {
    const action: IMessageBusEvent = { type: PUBLIC_EVENTS.STORAGE_SET_ITEM, data: { key: 'foo', value: 123 } };
    const result = storageReducer.reduce(initialState, action);

    expect(result).toEqual({
      config: null,
      storage: {
        foo: 123,
      },
    });
  });
});
