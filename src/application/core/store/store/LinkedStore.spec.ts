import { FrameAccessor } from '../../../../shared/services/message-bus/FrameAccessor';
import { BehaviorSubject } from 'rxjs';
import { LinkedStore } from './LinkedStore';
import { instance, mock, when } from 'ts-mockito';
import { IApplicationFrameState } from '../state/IApplicationFrameState';
import { IControlFrameWindow } from '../../../../shared/interfaces/IControlFrameWindow';

describe('LinkedStore', () => {
  let frameAccessorMock: FrameAccessor;
  let store$: BehaviorSubject<IApplicationFrameState>;
  let linkedStore: LinkedStore;

  beforeEach(() => {
    frameAccessorMock = mock(FrameAccessor);
    store$ = new BehaviorSubject(({ foo: 'bar' } as unknown) as IApplicationFrameState);

    when(frameAccessorMock.getControlFrame()).thenReturn({ stStore: store$ } as IControlFrameWindow);

    linkedStore = new LinkedStore(instance(frameAccessorMock));
  });

  it('returns state from control frames store', () => {
    expect(linkedStore.getState()).toEqual({ foo: 'bar' });
  });

  it('selects a piece of control frames store as observable', done => {
    linkedStore
      .select(s => (s as any).foo)
      .subscribe(result => {
        expect(result).toEqual('bar');
        done();
      });
  });

  it('allow subscribing for changes of control frames store', done => {
    linkedStore.subscribe(result => {
      if ((result as any).foo === 'baz') {
        done();
      }
    });

    store$.next(({ foo: 'baz' } as unknown) as IApplicationFrameState);
  });
});
