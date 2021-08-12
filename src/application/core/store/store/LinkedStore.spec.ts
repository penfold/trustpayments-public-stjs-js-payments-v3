import { FrameAccessor } from '../../../../shared/services/message-bus/FrameAccessor';
import { BehaviorSubject, of } from 'rxjs';
import { LinkedStore } from './LinkedStore';
import { instance, mock, when } from 'ts-mockito';
import { IApplicationFrameState } from '../state/IApplicationFrameState';
import { IControlFrameWindow } from '../../../../shared/interfaces/IControlFrameWindow';
import { FramesHub } from '../../../../shared/services/message-bus/FramesHub';
import { CONTROL_FRAME_IFRAME } from '../../models/constants/Selectors';

describe('LinkedStore', () => {
  let frameAccessorMock: FrameAccessor;
  let framesHubMock: FramesHub;
  let store$: BehaviorSubject<IApplicationFrameState>;
  let linkedStore: LinkedStore;

  beforeEach(() => {
    frameAccessorMock = mock(FrameAccessor);
    framesHubMock = mock(FramesHub);
    store$ = new BehaviorSubject(({ foo: 'bar' } as unknown) as IApplicationFrameState);

    when(framesHubMock.waitForFrame(CONTROL_FRAME_IFRAME)).thenReturn(of(CONTROL_FRAME_IFRAME));
    when(frameAccessorMock.getControlFrame()).thenReturn({ stStore: store$ } as IControlFrameWindow);

    linkedStore = new LinkedStore(instance(frameAccessorMock), instance(framesHubMock));
  });

  it('returns state from control frames store', () => {
    expect(linkedStore.getState()).toEqual({ foo: 'bar' });
  });

  it('selects a piece of control frames store as observable', done => {
    linkedStore
      .select(s => (s as unknown as { foo: string }).foo)
      .subscribe(result => {
        expect(result).toEqual('bar');
        done();
      });
  });

  it('allow subscribing for changes of control frames store', done => {
    linkedStore.subscribe(result => {
      if ((result as unknown as { foo: string }).foo === 'baz') {
        done();
      }
    });

    store$.next(({ foo: 'baz' } as unknown) as IApplicationFrameState);
  });
});
