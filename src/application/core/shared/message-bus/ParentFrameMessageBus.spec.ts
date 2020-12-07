import { InterFrameCommunicator } from '../../../../shared/services/message-bus/InterFrameCommunicator';
import { FramesHub } from '../../../../shared/services/message-bus/FramesHub';
import { instance, mock, spy, verify, when } from 'ts-mockito';
import { ParentFrameMessageBus } from './ParentFrameMessageBus';
import { of, Subject } from 'rxjs';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { CONTROL_FRAME_IFRAME } from '../../models/constants/Selectors';

describe('ParentFrameMessageBus', () => {
  const sampleEvent: IMessageBusEvent = { type: 'FOO' };

  let interFrameCommunicatorMock: InterFrameCommunicator;
  let framesHubMock: FramesHub;
  let messageBus: ParentFrameMessageBus;
  let incomingEvent$: Subject<IMessageBusEvent>;

  beforeEach(() => {
    interFrameCommunicatorMock = mock(InterFrameCommunicator);
    framesHubMock = mock(FramesHub);
    incomingEvent$ = new Subject<IMessageBusEvent>();

    when(interFrameCommunicatorMock.incomingEvent$).thenReturn(incomingEvent$);
    when(framesHubMock.waitForFrame(CONTROL_FRAME_IFRAME)).thenReturn(of(CONTROL_FRAME_IFRAME));

    messageBus = new ParentFrameMessageBus(instance(interFrameCommunicatorMock), instance(framesHubMock));
  });

  it('subscribes to incoming events from communicator', done => {
    messageBus.subscribe(event => {
      expect(event).toBe(sampleEvent);
      done();
    });

    incomingEvent$.next(sampleEvent);
  });

  it('sends published events to control frame', () => {
    messageBus.publish(sampleEvent);

    verify(interFrameCommunicatorMock.send(sampleEvent, CONTROL_FRAME_IFRAME)).once();
  });

  it('displays console warning when failed to send event to control frame', () => {
    const consoleSpy = spy(console);

    when(interFrameCommunicatorMock.send(sampleEvent, CONTROL_FRAME_IFRAME)).thenThrow(new Error('foobar'));

    messageBus.publish(sampleEvent);

    verify(consoleSpy.warn('Cannot send event to ControlFrame. foobar')).once();
  });
});
