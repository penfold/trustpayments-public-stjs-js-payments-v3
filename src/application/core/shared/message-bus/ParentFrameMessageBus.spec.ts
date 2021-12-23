import { anything, deepEqual, instance, mock, spy, verify, when } from 'ts-mockito';
import { of, Subject } from 'rxjs';
import { ContainerInstance } from 'typedi';
import { FramesHub } from '../../../../shared/services/message-bus/FramesHub';
import { InterFrameCommunicator } from '../../../../shared/services/message-bus/InterFrameCommunicator';
import { IMessageBusEvent } from '../../models/IMessageBusEvent';
import { CONTROL_FRAME_IFRAME, MERCHANT_PARENT_FRAME } from '../../models/constants/Selectors';
import { SentryService } from '../../../../shared/services/sentry/SentryService';
import { FrameCommunicationError } from '../../../../shared/services/message-bus/errors/FrameCommunicationError';
import { ParentFrameMessageBus } from './ParentFrameMessageBus';

describe('ParentFrameMessageBus', () => {
  const sampleEvent: IMessageBusEvent = { type: 'FOO' };
  let consoleSpy: typeof console;

  let interFrameCommunicatorMock: InterFrameCommunicator;
  let framesHubMock: FramesHub;
  let messageBus: ParentFrameMessageBus;
  let incomingEvent$: Subject<IMessageBusEvent>;
  let containerMock: ContainerInstance;
  let sentryServiceMock: SentryService;

  beforeEach(() => {
    interFrameCommunicatorMock = mock(InterFrameCommunicator);
    framesHubMock = mock(FramesHub);
    containerMock = mock(ContainerInstance);
    sentryServiceMock = mock(SentryService);
    incomingEvent$ = new Subject<IMessageBusEvent>();
    consoleSpy = spy(console);

    when(interFrameCommunicatorMock.incomingEvent$).thenReturn(incomingEvent$);
    when(framesHubMock.waitForFrame(CONTROL_FRAME_IFRAME)).thenReturn(of(CONTROL_FRAME_IFRAME));
    when(containerMock.get(SentryService)).thenReturn(instance(sentryServiceMock));
    when(consoleSpy.warn(anything())).thenReturn(undefined);

    messageBus = new ParentFrameMessageBus(
      instance(interFrameCommunicatorMock),
      instance(framesHubMock),
      instance(containerMock),
    );
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

  it('displays console warning and sends event to sentry when failed to send event to control frame', () => {
    const error = new Error('foobar');

    when(interFrameCommunicatorMock.send(sampleEvent, CONTROL_FRAME_IFRAME)).thenThrow(error);

    messageBus.publish(sampleEvent);

    verify(consoleSpy.warn('Cannot send event to ControlFrame. foobar')).once();
  });

  it('sends FrameCommunicationError to sentry when returned from InterFrameCommunicator', () => {
    const error = new FrameCommunicationError('foobar', null, '', '');

    when(interFrameCommunicatorMock.send(sampleEvent, CONTROL_FRAME_IFRAME)).thenThrow(error);

    messageBus.publish(sampleEvent);

    verify(sentryServiceMock.sendCustomMessage(error)).once();
  });

  it('creates a FrameCommunicationError and sends it to sentry when sending fails', () => {
    const error = new Error('failed');

    when(interFrameCommunicatorMock.send(sampleEvent, CONTROL_FRAME_IFRAME)).thenThrow(error);

    messageBus.publish(sampleEvent);

    verify(sentryServiceMock.sendCustomMessage(deepEqual(new FrameCommunicationError(
      'Cannot send event to ControlFrame',
      sampleEvent,
      MERCHANT_PARENT_FRAME,
      CONTROL_FRAME_IFRAME,
      error
    )))).once();
  });
});
