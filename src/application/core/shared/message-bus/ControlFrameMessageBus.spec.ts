import { instance, mock, verify, when } from 'ts-mockito';
import { Observable, Subject } from 'rxjs';
import { InterFrameCommunicator } from '../../../../shared/services/message-bus/InterFrameCommunicator';
import IControlFrameWindow from '../../../../shared/interfaces/IControlFrameWindow';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { EventScope } from '../../models/constants/EventScope';
import { ControlFrameMessageBus } from './ControlFrameMessageBus';

describe('ControlFrameMessageBus', () => {
  let windowMock: IControlFrameWindow;
  let windowMockInstance: IControlFrameWindow;
  let interFrameCommunicatorMock: InterFrameCommunicator;
  let messageBus: ControlFrameMessageBus;
  let incomingEvent$: Subject<IMessageBusEvent>;

  const sampleEvent: IMessageBusEvent = { type: 'FOO' };
  const publicSampleEvent: IMessageBusEvent = { type: PUBLIC_EVENTS.SAMPLE_MESSAGE };

  beforeEach(() => {
    windowMock = mock<IControlFrameWindow>();
    windowMockInstance = instance(windowMock);
    interFrameCommunicatorMock = mock(InterFrameCommunicator);

    incomingEvent$ = new Subject();

    when(interFrameCommunicatorMock.incomingEvent$).thenReturn(incomingEvent$);

    messageBus = new ControlFrameMessageBus(windowMockInstance, instance(interFrameCommunicatorMock));
  });

  it('propagates messages from frame incoming events', done => {
    messageBus.subscribe(event => {
      expect(event).toBe(sampleEvent);
      done();
    });

    incomingEvent$.next(sampleEvent);
  });

  it('creates a shared message stream in frames window object', done => {
    expect(windowMockInstance.stMessages).toBeInstanceOf(Observable);

    windowMockInstance.stMessages.subscribe(event => {
      expect(event).toBe(sampleEvent);
      done();
    });

    messageBus.publish(sampleEvent);
  });

  it('send published event to parent frame', () => {
    messageBus.publish(publicSampleEvent,  EventScope.ALL_FRAMES);

    verify(interFrameCommunicatorMock.sendToParentFrame(publicSampleEvent)).once();
  });

  it('throws error when sending published private message to parent frame', () => {
    expect(() => messageBus.publish(sampleEvent,  EventScope.ALL_FRAMES)).toThrow('Cannot publish private event "FOO" to parent frame.');
  });
});
