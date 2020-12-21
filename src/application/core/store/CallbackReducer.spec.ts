import { CallbackReducer } from './CallbackReducer';

describe('CallbackReducer', () => {
  it('reduces state using given callback', () => {
    const reducerFunc = jest.fn().mockImplementation((state, action) => 'foobar');
    const reducer = new CallbackReducer(reducerFunc);

    const state = 'foo';
    const action = { type: 'FOO' };

    expect(reducer.reduce(state, action)).toEqual('foobar');
    expect(reducerFunc).toHaveBeenCalledWith(state, action);
  });
});
