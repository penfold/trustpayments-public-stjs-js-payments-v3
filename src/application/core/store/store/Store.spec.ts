import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { SimpleMessageBus } from '../../shared/message-bus/SimpleMessageBus';
import { Store } from './Store';
import { BehaviorSubject } from 'rxjs';
import { CallbackReducer } from '../CallbackReducer';

describe('Store', () => {
  const state = { foo: 'bar' };

  let messageBus: IMessageBus;
  let store: Store<{ foo: string }>;
  let state$: BehaviorSubject<{ foo: string }>;

  beforeEach(() => {
    messageBus = new SimpleMessageBus();
    state$ = new BehaviorSubject(state);
    store = new Store(state$, messageBus);
  });

  it('returns the current state', () => {
    expect(store.getState()).toEqual(state);
  });

  it('returns a piece of current state as observable', done => {
    store
      .select(s => s.foo)
      .subscribe(result => {
        expect(result).toBe('bar');
        done();
      });
  });

  it('allows subscribing to current state changes', done => {
    store.subscribe(s => {
      if (s.foo === 'baz') {
        done();
      }
    });

    state$.next({ foo: 'baz' });
  });

  it('updates the state using reducers in response to events in message bus', () => {
    const reducer = new CallbackReducer<{ foo: string }>((state, action) => {
      return action.type === 'BAR' ? { ...state, foo: action.data } : state;
    });

    const reducer2 = new CallbackReducer<{ foo: string }>((state, action) => {
      return action.type === 'BAR' ? { ...state, foo: `${state.foo}${state.foo}` } : state;
    });

    store.addReducer(reducer);
    store.addReducer(reducer2);

    messageBus.publish({ type: 'FOO', data: 'aaa' });
    messageBus.publish({ type: 'BAR', data: 'bbb' });
    messageBus.publish({ type: 'XYZ', data: 'ccc' });

    expect(store.getState()).toEqual({ foo: 'bbbbbb' });
  });
});
