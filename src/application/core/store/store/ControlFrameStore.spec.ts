import { BehaviorSubject } from 'rxjs';
import { SimpleMessageBus } from '../../shared/message-bus/SimpleMessageBus';
import IControlFrameWindow from '../../../../shared/interfaces/IControlFrameWindow';
import { IApplicationFrameState } from '../state/IApplicationFrameState';
import { ControlFrameStore } from './ControlFrameStore';

describe('ControlFrameStore', () => {
  it('puts the state subject in window object', () => {
    const window: IControlFrameWindow = {} as IControlFrameWindow;
    const store = new ControlFrameStore(new SimpleMessageBus(), window);
    const state = ({ foo: 'bar' } as unknown) as IApplicationFrameState;

    expect(window.stStore).toBeInstanceOf(BehaviorSubject);

    window.stStore.next(state);

    expect(store.getState()).toEqual(state);
  });
});
