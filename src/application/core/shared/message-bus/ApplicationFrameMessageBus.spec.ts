import { FrameAccessor } from '../../../../shared/services/message-bus/FrameAccessor';
import { InterFrameCommunicator } from '../../../../shared/services/message-bus/InterFrameCommunicator';
import { ApplicationFrameMessageBus } from './ApplicationFrameMessageBus';
import { anything, instance, mock, verify, when } from 'ts-mockito';
import { Subject } from 'rxjs';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { IControlFrameWindow } from '../../../../shared/interfaces/IControlFrameWindow';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';

describe('ApplicationFrameMessageBus', () => {
  let frameAccessorMock: FrameAccessor;
  let interFrameCommunicatorMock: InterFrameCommunicator;
  let messageBus: ApplicationFrameMessageBus;
  let sharedMessage$: Subject<IMessageBusEvent>;

  const sampleEvent: IMessageBusEvent = { type: 'FOO' };
  const publicSampleEvent: IMessageBusEvent = { type: PUBLIC_EVENTS.SAMPLE_MESSAGE };

  beforeEach(() => {
    frameAccessorMock = mock(FrameAccessor);
    interFrameCommunicatorMock = mock(InterFrameCommunicator);
    sharedMessage$ = new Subject();

    when(frameAccessorMock.getControlFrame()).thenReturn(({
      stMessages: sharedMessage$
    } as unknown) as IControlFrameWindow);

    messageBus = new ApplicationFrameMessageBus(instance(frameAccessorMock), instance(interFrameCommunicatorMock));
  });

  it('propagates messages from shared stream', done => {
    messageBus.subscribe(event => {
      expect(event).toBe(sampleEvent);
      done();
    });

    sharedMessage$.next(sampleEvent);
  });

  it('sends published messages to control frame', () => {
    messageBus.publish(sampleEvent, false);

    verify(interFrameCommunicatorMock.sendToControlFrame(sampleEvent)).once();
    verify(interFrameCommunicatorMock.sendToParentFrame(anything())).never();
  });

  it('sends published messages to parent frame when specified', () => {
    messageBus.publish(publicSampleEvent, true);

    verify(interFrameCommunicatorMock.sendToControlFrame(publicSampleEvent)).once();
    verify(interFrameCommunicatorMock.sendToParentFrame(publicSampleEvent)).once();
  });

  it('throws error when sending published private message to parent frame', () => {
    expect(() => messageBus.publish(sampleEvent, true)).toThrow('Cannot publish private event "FOO" to parent frame.');
  });
});
