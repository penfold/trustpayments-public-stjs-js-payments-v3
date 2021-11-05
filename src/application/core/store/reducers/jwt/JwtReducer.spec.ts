import { PUBLIC_EVENTS } from '../../../models/constants/EventTypes';
import { IApplicationFrameState } from '../../state/IApplicationFrameState';
import { JwtReducer } from './JwtReducer';

describe('JwtReducer', () => {
  let reducer: JwtReducer;

  beforeEach(() => {
    reducer = new JwtReducer();
  });

  it('sets the jwt and original jwt on JWT_UPDATED event', () => {
    const initialState = {} as IApplicationFrameState;
    const result = reducer.reduce(initialState, { type: PUBLIC_EVENTS.JWT_UPDATED, data: 'newjwt' });

    expect(result).toEqual({
      jwt: 'newjwt',
      originalJwt: 'newjwt',
    });
  });

  it('replaces the jwt with the new jwt on JWT_REPLACED event', () => {
    const initialState = { jwt: 'foo', originalJwt: 'bar' } as IApplicationFrameState;
    const result = reducer.reduce(initialState, { type: PUBLIC_EVENTS.JWT_REPLACED, data: 'newjwt' });

    expect(result).toEqual({
      jwt: 'newjwt',
      originalJwt: 'bar',
    });
  });

  it('replaces the jwt with the original jwt on JWT_RESET event', () => {
    const initialState = { jwt: 'foo', originalJwt: 'bar' } as IApplicationFrameState;
    const result = reducer.reduce(initialState, { type: PUBLIC_EVENTS.JWT_RESET });

    expect(result).toEqual({
      jwt: 'bar',
      originalJwt: 'bar',
    });
  });

  it('removes the jwt and the original jwt on DESTROY event', () => {
    const initialState = { jwt: 'foo', originalJwt: 'bar' } as IApplicationFrameState;
    const result = reducer.reduce(initialState, { type: PUBLIC_EVENTS.DESTROY });

    expect(result).toEqual({});
  });
});
