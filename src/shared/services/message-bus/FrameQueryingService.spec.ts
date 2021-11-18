import { anything, capture, instance, mock, verify, when } from 'ts-mockito';
import { mapTo, take, toArray, of, Subject, throwError, timer } from 'rxjs';
import {
  CARD_NUMBER_IFRAME,
  CONTROL_FRAME_IFRAME,
  MERCHANT_PARENT_FRAME,
} from '../../../application/core/models/constants/Selectors';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { FrameIdentifier } from './FrameIdentifier';
import { InterFrameCommunicator } from './InterFrameCommunicator';
import { FrameQueryingService } from './FrameQueryingService';
import { ErrorReconstructor } from './ErrorReconstructor';
import { QueryMessage } from './messages/QueryMessage';
import { ResponseMessage } from './messages/ResponseMessage';

describe('FrameQueryingService', () => {
  let frameIdentifierMock: FrameIdentifier;
  let errorReconstructorMock: ErrorReconstructor;
  let interFrameCommunicatorMock: InterFrameCommunicator;
  let frameQueryingService: FrameQueryingService;
  const incomingEvents$ = new Subject<IMessageBusEvent>();

  beforeEach(() => {
    frameIdentifierMock = mock(FrameIdentifier);
    errorReconstructorMock = mock(ErrorReconstructor);
    interFrameCommunicatorMock = mock(InterFrameCommunicator);

    when(interFrameCommunicatorMock.incomingEvent$).thenReturn(incomingEvents$);
    when(frameIdentifierMock.getFrameName()).thenReturn(CARD_NUMBER_IFRAME);
    when(errorReconstructorMock.reconstruct(anything())).thenCall(data => data);

    frameQueryingService = new FrameQueryingService(
      instance(frameIdentifierMock),
      instance(errorReconstructorMock),
    );

    frameQueryingService.attach(instance(interFrameCommunicatorMock));
  });

  describe('query', () => {
    const queryMessage: IMessageBusEvent = { type: 'FOO', data: 'foo' };
    const responseMessage: IMessageBusEvent = { type: 'BAR', data: 'bar' };

    it('throws an error when not attached', () => {
      const detachedInstance = new FrameQueryingService(
        instance(frameIdentifierMock),
        instance(errorReconstructorMock),
      );

      expect(() => detachedInstance.query(queryMessage, MERCHANT_PARENT_FRAME))
        .toThrowError('Frame querying is not available - service is in a detached state.');
    });

    it('sends query message to target frame with current frame name as the source', () => {
      frameQueryingService.query(queryMessage, MERCHANT_PARENT_FRAME).subscribe();

      const [message] = capture(interFrameCommunicatorMock.send).last();

      verify(interFrameCommunicatorMock.send(anything(), MERCHANT_PARENT_FRAME)).once();
      expect(message).toBeInstanceOf(QueryMessage);
      expect(message.data).toBe(queryMessage);
      expect((message as QueryMessage).sourceFrame).toBe(CARD_NUMBER_IFRAME);
    });

    it('sends query message to target frame with default frame name as the source when not provided', () => {
      when(frameIdentifierMock.getFrameName()).thenReturn(undefined);

      frameQueryingService.query(queryMessage, CONTROL_FRAME_IFRAME).subscribe();

      const [message] = capture(interFrameCommunicatorMock.send).last();

      verify(interFrameCommunicatorMock.send(anything(), CONTROL_FRAME_IFRAME)).once();
      expect(message).toBeInstanceOf(QueryMessage);
      expect(message.data).toBe(queryMessage);
      expect((message as QueryMessage).sourceFrame).toBe(MERCHANT_PARENT_FRAME);
    });

    it('resolves with a received response message data', done => {
      frameQueryingService.query(queryMessage, MERCHANT_PARENT_FRAME).subscribe(result => {
        expect(result).toBe(responseMessage);
        done();
      });

      const [wrappedQueryMessage] = capture(interFrameCommunicatorMock.send).last();

      const wrappedResponseMessage = new ResponseMessage(
        responseMessage,
        (wrappedQueryMessage as QueryMessage).queryId,
        (wrappedQueryMessage as QueryMessage).sourceFrame,
        false,
      );

      incomingEvents$.next(wrappedResponseMessage);
    });

    it('rejects with a received response error message data', done => {
      frameQueryingService.query(queryMessage, MERCHANT_PARENT_FRAME).subscribe({
        error: response => {
          expect(response).toBe(responseMessage);
          done();
        },
      });

      const [wrappedQueryMessage] = capture(interFrameCommunicatorMock.send).last();

      const wrappedResponseMessage = new ResponseMessage(
        responseMessage,
        (wrappedQueryMessage as QueryMessage).queryId,
        (wrappedQueryMessage as QueryMessage).sourceFrame,
        true,
      );

      incomingEvents$.next(wrappedResponseMessage);
    });
  });

  describe('whenReceive()', () => {
    const queryMessage: IMessageBusEvent = { type: 'FOO', data: 'foo' };
    const responseMessage: IMessageBusEvent = { type: 'BAR', data: 'bar' };

    it('listens to query messages, pass them to responders and sends back the response', done => {
      const fooResponder = jest.fn().mockImplementationOnce(() => of(responseMessage));
      const wrappedQueryMessage = new QueryMessage(queryMessage, MERCHANT_PARENT_FRAME);

      frameQueryingService.whenReceive(queryMessage.type, fooResponder);

      incomingEvents$.next(wrappedQueryMessage);

      setTimeout(() => {
        const [wrappedResponseMessage] = capture(interFrameCommunicatorMock.send).last();

        verify(interFrameCommunicatorMock.send(wrappedResponseMessage, MERCHANT_PARENT_FRAME)).once();
        expect(fooResponder).toHaveBeenCalledWith(queryMessage);
        expect(wrappedResponseMessage).toBeInstanceOf(ResponseMessage);
        expect(wrappedResponseMessage.data).toBe(responseMessage);
        expect((wrappedResponseMessage as ResponseMessage<unknown>).isError).toBe(false);
        expect((wrappedResponseMessage as ResponseMessage<unknown>).queryId).toBe(wrappedQueryMessage.queryId);
        expect((wrappedResponseMessage as ResponseMessage<unknown>).queryFrame).toBe(wrappedQueryMessage.sourceFrame);
        done();
      });
    });

    it('listens to query messages, pass them to responders and sends back error response', done => {
      const error = new Error('failure');
      const fooResponder = jest.fn().mockImplementationOnce(() => throwError(() => error));
      const wrappedQueryMessage = new QueryMessage(queryMessage, MERCHANT_PARENT_FRAME);

      frameQueryingService.whenReceive(queryMessage.type, fooResponder);

      incomingEvents$.next(wrappedQueryMessage);

      setTimeout(() => {
        const [wrappedResponseMessage] = capture(interFrameCommunicatorMock.send).last();

        verify(interFrameCommunicatorMock.send(wrappedResponseMessage, MERCHANT_PARENT_FRAME)).once();
        expect(fooResponder).toHaveBeenCalledWith(queryMessage);
        expect(wrappedResponseMessage).toBeInstanceOf(ResponseMessage);
        expect(wrappedResponseMessage.data).toBe(error);
        expect((wrappedResponseMessage as ResponseMessage<unknown>).isError).toBe(true);
        expect((wrappedResponseMessage as ResponseMessage<unknown>).queryId).toBe(wrappedQueryMessage.queryId);
        expect((wrappedResponseMessage as ResponseMessage<unknown>).queryFrame).toBe(wrappedQueryMessage.sourceFrame);
        done();
      });
    });

    it('processes all queries and doesnt cancel processing when new query arrives', done => {
      const fooResponder = () => timer(100).pipe(mapTo({ type: 'FOO_RESPONSE' }));
      const barResponder = () => of({ type: 'BAR_RESPONSE' });
      const fooQueryMessage = new QueryMessage({ type: 'FOO' }, 'foobar');
      const barQueryMessage = new QueryMessage({ type: 'BAR' }, 'foobar');

      frameQueryingService.whenReceive('FOO', fooResponder);
      frameQueryingService.whenReceive('BAR', barResponder);

      const response$: Subject<IMessageBusEvent> = new Subject();

      when(interFrameCommunicatorMock.send(anything(), anything())).thenCall(response => {
        response$.next(response);
      });

      response$.pipe(take(2), toArray()).subscribe(responses => {
        const [firstResponse, secondResponse] = responses;
        expect(firstResponse.data).toEqual({ type: 'BAR_RESPONSE' });
        expect(secondResponse.data).toEqual({ type: 'FOO_RESPONSE' });
        done();
      });

      incomingEvents$.next(fooQueryMessage);
      incomingEvents$.next(barQueryMessage);
    });

    it('processes each responder only once even if it was assigned multiple times', done => {
      const responder = () => of({ type: 'FOO_RESPONSE' });
      const wrappedQueryMessage = new QueryMessage(queryMessage, 'foobar');

      frameQueryingService.whenReceive(queryMessage.type, responder);
      frameQueryingService.whenReceive(queryMessage.type, responder);
      frameQueryingService.whenReceive(queryMessage.type, responder);

      incomingEvents$.next(wrappedQueryMessage);

      setTimeout(() => {
        verify(interFrameCommunicatorMock.send(anything(), anything())).once();
        done();
      });
    });

    it('doesnt process queries in detached state', done => {
      const fooResponder = jest.fn().mockImplementationOnce(() => of(responseMessage));
      const wrappedQueryMessage = new QueryMessage(queryMessage, 'foobar');

      frameQueryingService.whenReceive(queryMessage.type, fooResponder);
      frameQueryingService.detach();

      incomingEvents$.next(wrappedQueryMessage);

      setTimeout(() => {
        verify(interFrameCommunicatorMock.send(anything(), anything())).never();
        expect(fooResponder).not.toHaveBeenCalled();
        done();
      });
    });
  });

  afterEach(() => {
    frameQueryingService.detach();
  });
});
