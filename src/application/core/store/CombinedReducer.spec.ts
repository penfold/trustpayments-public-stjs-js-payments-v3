import { CombinedReducer } from './CombinedReducer';
import { CallbackReducer } from './CallbackReducer';

describe('CombinedReducer', () => {
  it('returns the same state when no reducers are provided', () => {
    const reducer = new CombinedReducer<{ foo: string }>([]);
    const state = { foo: 'bar' };

    expect(reducer.reduce(state, { type: 'FOO' })).toBe(state);
  });

  it('combines multiple reducers', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const fooReducer = new CallbackReducer<string>((state, action) => `${state}foo`);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const barReducer = new CallbackReducer<string>((state, action) => `${state}bar`);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const xyzReducer = new CallbackReducer<string>((state, action) => `${state}xyz`);
    const combinedReducer = new CombinedReducer<string>([fooReducer, barReducer, xyzReducer]);

    expect(combinedReducer.reduce('', { type: 'FOO' })).toBe('foobarxyz');
  });
});
