import { BehaviorSubject } from 'rxjs';
import { TestStore } from './TestStore';

type StateType = { [index: string]: unknown };

describe('TestStore', () => {
  let state$: BehaviorSubject<StateType>;
  let testStore: TestStore<StateType>;

  beforeEach(() => {
    state$ = new BehaviorSubject({});
    testStore = new TestStore(state$);
  });

  it('returns the current state', () => {
    state$.next({ foo: 'bar' });
    expect(testStore.getState()).toEqual({ foo: 'bar' });
  });

  it('allows to change current state', () => {
    testStore.setState({ bar: 'baz' });
    expect(testStore.getState()).toEqual({ bar: 'baz' });
  });

  it('allows to select state property', () => {
    const foos: unknown[] = [];

    testStore.select(state => state.foo).subscribe(foo => foos.push(foo));

    state$.next({ foo: 'bar' });
    state$.next({ foo: 'baz' });

    expect(foos).toEqual([undefined, 'bar', 'baz']);
  });

  it('allows to subscribe to state changes', () => {
    const states: StateType[] = [];

    testStore.subscribe(state => states.push(state));

    state$.next({ foo: 'bar' });
    state$.next({ foo: 'baz' });

    expect(states).toEqual([
      {},
      { foo: 'bar' },
      { foo: 'baz' },
    ]);
  });
});
