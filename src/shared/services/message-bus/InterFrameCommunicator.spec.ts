import { FrameIdentifier } from './FrameIdentifier';
import { FrameAccessor } from './FrameAccessor';
import { InterFrameCommunicator } from './InterFrameCommunicator';
import { anyOfClass, anything, capture, instance, mock, spy, verify, when } from 'ts-mockito';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { environment } from '../../../environments/environment';
import { CONTROL_FRAME_IFRAME, MERCHANT_PARENT_FRAME } from '../../../application/core/models/constants/Selectors';
import { Debug } from '../../Debug';
import { FrameNotFound } from './errors/FrameNotFound';
import { first, mapTo, take, toArray } from 'rxjs/operators';
import { ContainerInstance } from 'typedi';
import { CONFIG } from '../../dependency-injection/InjectionTokens';
import { QueryMessage } from './messages/QueryMessage';
import { ResponseMessage } from './messages/ResponseMessage';
import { of, Subject, timer } from 'rxjs';

describe('InterFrameCommunicator', () => {
  const PARENT_FRAME_ORIGIN = 'https://foobar.com';
  const APP_FRAME_ORIGIN = new URL(environment.FRAME_URL).origin;

  let frameIdentifierMock: FrameIdentifier;
  let frameAccessorMock: FrameAccessor;
  let containerMock: ContainerInstance;
  let interFrameCommunicator: InterFrameCommunicator;
  let parentFrameMock: Window;
  let parentFrame: Window;
  let foobarFrameMock: Window;
  let foobarFrame: Window;

  beforeEach(() => {
    frameIdentifierMock = mock(FrameIdentifier);
    frameAccessorMock = mock(FrameAccessor);
    containerMock = mock(ContainerInstance);
    parentFrameMock = mock<Window>();
    parentFrame = instance(parentFrameMock);
    Object.setPrototypeOf(parentFrame, Window.prototype);
    foobarFrameMock = mock<Window>();
    foobarFrame = instance(foobarFrameMock);
    Object.setPrototypeOf(foobarFrame, Window.prototype);

    interFrameCommunicator = new InterFrameCommunicator(
      instance(frameIdentifierMock),
      instance(frameAccessorMock),
      instance(containerMock),
      window
    );

    when(frameAccessorMock.getParentFrame()).thenReturn(parentFrame);
    when(frameAccessorMock.getFrame('foobar')).thenReturn(foobarFrame);
    when(containerMock.has(CONFIG)).thenReturn(true);
    when(containerMock.get(CONFIG)).thenReturn({
      origin: PARENT_FRAME_ORIGIN
    });
  });

  describe('send', () => {
    const message: IMessageBusEvent = { type: 'FOOBAR', data: 'foobar' };

    it('should send message to target frame', () => {
      interFrameCommunicator.send(message, foobarFrame);

      verify(foobarFrameMock.postMessage(message, APP_FRAME_ORIGIN)).once();
    });

    it('should send message to parent frame with parent frame origin', () => {
      interFrameCommunicator.send(message, parentFrame);
      interFrameCommunicator.send(message, MERCHANT_PARENT_FRAME);

      verify(parentFrameMock.postMessage(message, PARENT_FRAME_ORIGIN)).twice();
    });

    it('should send message to other frame with current frame origin', () => {
      interFrameCommunicator.send(message, 'foobar');

      verify(foobarFrameMock.postMessage(message, APP_FRAME_ORIGIN)).once();
    });

    it('should log warning when target frame is not found', () => {
      const debugSpy = spy(Debug);
      const errorMessage = 'Target frame "notexistingframe" not found.';

      when(frameAccessorMock.getFrame('notexistingframe')).thenThrow(new FrameNotFound(errorMessage));
      when(debugSpy.warn(anything())).thenReturn(undefined);

      interFrameCommunicator.send(message, 'notexistingframe');

      verify(debugSpy.warn(errorMessage)).once();
    });

    it('should throw error when posting message fails', () => {
      when(foobarFrameMock.postMessage(anything(), anything())).thenThrow(new Error('sending failed'));

      expect(() => interFrameCommunicator.send(message, foobarFrame)).toThrowError('sending failed');
    });
  });

  describe('close', () => {
    it('should emit communicationClosed$ event', done => {
      interFrameCommunicator.communicationClosed$.pipe(first()).subscribe(done);
      interFrameCommunicator.close();
    });
  });

  describe('sendToParentFrame', () => {
    it('should send message to parent frame', () => {
      const message: IMessageBusEvent = { type: 'FOOBAR', data: 'foobar' };

      interFrameCommunicator.sendToParentFrame(message);

      verify(parentFrameMock.postMessage(message, PARENT_FRAME_ORIGIN)).once();
    });
  });

  describe('sendToControlFrame', () => {
    it('should send message to control frame', () => {
      const message: IMessageBusEvent = { type: 'FOOBAR', data: 'foobar' };
      const controlFrameMock: Window = mock<Window>();

      when(frameAccessorMock.getFrame(CONTROL_FRAME_IFRAME)).thenReturn(instance(controlFrameMock));

      interFrameCommunicator.sendToControlFrame(message);

      verify(controlFrameMock.postMessage(message, APP_FRAME_ORIGIN)).once();
    });
  });

  describe('query', () => {
    const queryMessage: IMessageBusEvent = { type: 'FOO', data: 'foo' };
    const responseMessage: IMessageBusEvent = { type: 'BAR', data: 'bar' };

    it('sends query message to target frame and returns cathced response payload', done => {
      const communicatorSpy = spy(interFrameCommunicator);
      const queryResultPromise = interFrameCommunicator.query(queryMessage, MERCHANT_PARENT_FRAME);
      const [wrappedQueryMessage, targetFrame] = capture<QueryMessage, Window | string>(communicatorSpy.send).last();

      expect(queryResultPromise).toBeInstanceOf(Promise);
      expect(targetFrame).toBe(MERCHANT_PARENT_FRAME);
      expect(wrappedQueryMessage.type).toBe(QueryMessage.MESSAGE_TYPE);
      expect(wrappedQueryMessage.data).toBe(queryMessage);

      const wrappedResponseMessage = new ResponseMessage(
        responseMessage,
        wrappedQueryMessage.queryId,
        wrappedQueryMessage.sourceFrame
      );

      window.postMessage(wrappedResponseMessage, '*');

      queryResultPromise.then(response => {
        expect(response).toBe(responseMessage);
        done();
      });
    });
  });

  describe('whenReceive', () => {
    it('returns thenRespond object allowing to register a responder', () => {
      expect(interFrameCommunicator.whenReceive('FOOBAR')).toMatchObject({ thenRespond: jasmine.any(Function) });
    });
  });

  describe('init', () => {
    let communicatorSpy: InterFrameCommunicator;

    beforeEach(() => {
      interFrameCommunicator.init();
      communicatorSpy = spy(interFrameCommunicator);
    });

    it('it listens to query messages and pass them to responders', done => {
      const fooResponder = jest.fn().mockImplementationOnce((event: IMessageBusEvent) => of({ type: 'BAR' }));
      const queryMessage = new QueryMessage({ type: 'FOO' }, 'foobar');

      interFrameCommunicator.whenReceive('FOO').thenRespond(fooResponder);

      window.postMessage(queryMessage, '*');

      setTimeout(() => {
        const [responseMessage] = capture<ResponseMessage<any>, string | Window>(communicatorSpy.send).last();

        verify(communicatorSpy.send(responseMessage, 'foobar')).once();
        expect(fooResponder).toHaveBeenCalledWith({ type: 'FOO' });
        expect(responseMessage).toBeInstanceOf(ResponseMessage);
        expect(responseMessage.data).toEqual({ type: 'BAR' });
        done();
      });
    });

    it('it processes all queries and doesnt cancel processing when new query arrives', done => {
      const fooResponder = (event: IMessageBusEvent) => timer(100).pipe(mapTo({ type: 'FOO_RESPONSE' }));
      const barResponder = (event: IMessageBusEvent) => of({ type: 'BAR_RESPONSE' });
      const fooQueryMessage = new QueryMessage({ type: 'FOO' }, 'foobar');
      const barQueryMessage = new QueryMessage({ type: 'BAR' }, 'foobar');

      interFrameCommunicator.whenReceive('FOO').thenRespond(fooResponder);
      interFrameCommunicator.whenReceive('BAR').thenRespond(barResponder);

      const response$: Subject<IMessageBusEvent> = new Subject();

      when(communicatorSpy.send(anything(), anything())).thenCall(response => {
        response$.next(response);
      });

      window.postMessage(fooQueryMessage, '*');
      window.postMessage(barQueryMessage, '*');

      response$.pipe(take(2), toArray()).subscribe(responses => {
        const [firstResponse, secondResponse] = responses;
        expect(firstResponse.data).toEqual({ type: 'BAR_RESPONSE' });
        expect(secondResponse.data).toEqual({ type: 'FOO_RESPONSE' });
        done();
      });
    });

    it('processes each responder only once even if it was assigned multiple times', done => {
      const responder = (event: IMessageBusEvent) => of({ type: 'FOO_RESPONSE' });
      const queryMessage = new QueryMessage({ type: 'FOO' }, 'foobar');

      interFrameCommunicator.whenReceive('FOO').thenRespond(responder);
      interFrameCommunicator.whenReceive('FOO').thenRespond(responder);
      interFrameCommunicator.whenReceive('FOO').thenRespond(responder);

      window.postMessage(queryMessage, '*');

      setTimeout(() => {
        verify(communicatorSpy.send(anything(), anything())).once();
        done();
      });
    });

    it('doesnt process queries after communication closed event', done => {
      const fooResponder = jest.fn().mockImplementationOnce((event: IMessageBusEvent) => of({ type: 'BAR' }));
      const queryMessage = new QueryMessage({ type: 'FOO' }, 'foobar');

      interFrameCommunicator.whenReceive('FOO').thenRespond(fooResponder);
      interFrameCommunicator.close();

      window.postMessage(queryMessage, '*');

      setTimeout(() => {
        verify(communicatorSpy.send(anything(), anything())).never();
        done();
      });
    });

    it('ignores messages without data or data.type properties', done => {
      interFrameCommunicator.incomingEvent$.subscribe(event => {
        expect(event.type).toEqual('foobar');
        done();
      });

      window.postMessage(null, '*');
      window.postMessage('somestring', '*');
      window.postMessage({ foo: 'bar' }, '*');
      window.postMessage({ type: 'foobar' }, '*');
    });

    afterEach(() => {
      interFrameCommunicator.close();
    });
  });
});
