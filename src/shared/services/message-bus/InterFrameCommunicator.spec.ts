import { anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { first, of } from 'rxjs';
import { ContainerInstance } from 'typedi';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { environment } from '../../../environments/environment';
import { CONTROL_FRAME_IFRAME, MERCHANT_PARENT_FRAME } from '../../../application/core/models/constants/Selectors';
import { CONFIG } from '../../dependency-injection/InjectionTokens';
import { SentryService } from '../sentry/SentryService';
import { FrameNotFound } from './errors/FrameNotFound';
import { InterFrameCommunicator } from './InterFrameCommunicator';
import { FrameAccessor } from './FrameAccessor';
import { EventDataSanitizer } from './EventDataSanitizer';
import { IFrameQueryingService } from './interfaces/IFrameQueryingService';
import { FrameQueryingService } from './FrameQueryingService';
import { FrameIdentifier } from './FrameIdentifier';
import { FrameCommunicationError } from './errors/FrameCommunicationError';

describe('InterFrameCommunicator', () => {
  const PARENT_FRAME_ORIGIN = 'https://foobar.com';
  const APP_FRAME_ORIGIN = new URL(environment.FRAME_URL).origin;

  let frameAccessorMock: FrameAccessor;
  let containerMock: ContainerInstance;
  let interFrameCommunicator: InterFrameCommunicator;
  let parentFrameMock: Window;
  let parentFrame: Window;
  let foobarFrameMock: Window;
  let foobarFrame: Window;
  let eventDataSanitizerMock: EventDataSanitizer;
  let frameQueryingServiceMock: IFrameQueryingService;
  let frameIdentifierMock: FrameIdentifier;
  let sentryServiceMock: SentryService;

  beforeEach(() => {
    frameAccessorMock = mock(FrameAccessor);
    containerMock = mock(ContainerInstance);
    parentFrameMock = mock<Window>();
    parentFrame = instance(parentFrameMock);
    Object.setPrototypeOf(parentFrame, Window.prototype);
    foobarFrameMock = mock<Window>();
    foobarFrame = instance(foobarFrameMock);
    Object.setPrototypeOf(foobarFrame, Window.prototype);
    eventDataSanitizerMock = mock(EventDataSanitizer);
    frameQueryingServiceMock = mock<IFrameQueryingService>();
    frameIdentifierMock = mock(FrameIdentifier);
    sentryServiceMock = mock(SentryService);

    interFrameCommunicator = new InterFrameCommunicator(
      instance(frameAccessorMock),
      instance(containerMock),
      instance(eventDataSanitizerMock),
      instance(frameQueryingServiceMock),
      instance(frameIdentifierMock),
      window,
    );

    when(frameAccessorMock.getParentFrame()).thenReturn(parentFrame);
    when(frameAccessorMock.getFrame('foobar')).thenReturn(foobarFrame);
    when(containerMock.has(CONFIG)).thenReturn(true);
    when(containerMock.get(CONFIG)).thenReturn({
      origin: PARENT_FRAME_ORIGIN,
    });
    when(containerMock.get(SentryService)).thenReturn(instance(sentryServiceMock));
    when(eventDataSanitizerMock.sanitize(anything())).thenCall((data) => data);
    when(frameIdentifierMock.getFrameName()).thenReturn(MERCHANT_PARENT_FRAME);
  });

  describe('constructor()', () => {
    it('ignores incoming messages without data or data.type properties', done => {
      interFrameCommunicator.incomingEvent$.subscribe(event => {
        expect(event.type).toEqual('foobar');
        done();
      });

      window.postMessage(null, '*');
      window.postMessage('somestring', '*');
      window.postMessage({ foo: 'bar' }, '*');
      window.postMessage({ type: 'foobar' }, '*');
    });
  });

  describe('init', () => {
    it('attaches itself to the frame querying service', () => {
      interFrameCommunicator.init();

      verify((frameQueryingServiceMock as FrameQueryingService).attach(interFrameCommunicator)).once();
    });
  });

  describe('send', () => {
    const message: IMessageBusEvent = { type: 'FOOBAR', data: 'foobar' };

    it('should send message to target frame', () => {
      interFrameCommunicator.send(message, foobarFrame);

      verify(foobarFrameMock.postMessage(deepEqual(message), APP_FRAME_ORIGIN)).once();
    });

    it('should send message to parent frame with parent frame origin', () => {
      interFrameCommunicator.send(message, parentFrame);
      interFrameCommunicator.send(message, MERCHANT_PARENT_FRAME);

      verify(parentFrameMock.postMessage(deepEqual(message), PARENT_FRAME_ORIGIN)).twice();
    });

    it('should send message to other frame with current frame origin', () => {
      interFrameCommunicator.send(message, 'foobar');

      verify(foobarFrameMock.postMessage(deepEqual(message), APP_FRAME_ORIGIN)).once();
    });

    it('should throw FrameCommunicationError when target frame is not found', () => {
      const notFoundError = new FrameNotFound('Target frame "notexistingframe" not found.');

      when(frameAccessorMock.getFrame('notexistingframe')).thenThrow(notFoundError);

      expect(() => interFrameCommunicator.send(message, 'notexistingframe'))
        .toThrowError(new FrameCommunicationError(
          'Failed to post inter-frame message.',
          message,
          MERCHANT_PARENT_FRAME,
          'notexistingframe',
          notFoundError,
        ));
    });

    it('should report an error to sentry when sending message fails', done => {
      const error = new Error('sending failed');

      when(foobarFrameMock.postMessage(anything(), anything())).thenThrow(error);

      interFrameCommunicator.send(message, foobarFrame);

      setTimeout(() => {
        verify(sentryServiceMock.sendCustomMessage(deepEqual(new FrameCommunicationError(
          'Failed to post inter-frame message.',
          message,
          MERCHANT_PARENT_FRAME,
          String(foobarFrame),
          error,
        )))).once();
        done();
      });
    });
  });

  describe('close', () => {
    it('should emit communicationClosed$ event', done => {
      interFrameCommunicator.communicationClosed$.pipe(first()).subscribe(() => done());
      interFrameCommunicator.close();
    });

    it('detaches itself from the frame querying service', () => {
      interFrameCommunicator.close();

      verify((frameQueryingServiceMock as FrameQueryingService).detach()).once();
    });
  });

  describe('sendToParentFrame', () => {
    it('should send message to parent frame', () => {
      const message: IMessageBusEvent = { type: 'FOOBAR', data: 'foobar' };

      interFrameCommunicator.sendToParentFrame(message);

      verify(parentFrameMock.postMessage(deepEqual(message), PARENT_FRAME_ORIGIN)).once();
    });
  });

  describe('sendToControlFrame', () => {
    it('should send message to control frame', () => {
      const message: IMessageBusEvent = { type: 'FOOBAR', data: 'foobar' };
      const controlFrameMock: Window = mock<Window>();

      when(frameAccessorMock.getFrame(CONTROL_FRAME_IFRAME)).thenReturn(instance(controlFrameMock));

      interFrameCommunicator.sendToControlFrame(message);

      verify(controlFrameMock.postMessage(deepEqual(message), APP_FRAME_ORIGIN)).once();
    });
  });

  describe('query', () => {
    it('sends query message to querying service', async () => {
      const query = { type: 'FOOBAR' };
      const response = { foo: 'bar' };

      when(frameQueryingServiceMock.query(anything(), anything())).thenReturn(of(response));

      expect(await interFrameCommunicator.query(query, MERCHANT_PARENT_FRAME)).toBe(response);

      verify(frameQueryingServiceMock.query(query, MERCHANT_PARENT_FRAME)).once();
    });
  });

  describe('whenReceive', () => {
    it('returns thenRespond object allowing to register a responder', () => {
      const callback = () => undefined;

      interFrameCommunicator.whenReceive('FOOBAR').thenRespond(callback);

      verify(frameQueryingServiceMock.whenReceive('FOOBAR', callback)).once();
    });
  });
});
