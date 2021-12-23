import { Event, EventHint } from '@sentry/types';
import { anything, instance, mock,when } from 'ts-mockito';
import { TimeoutError } from 'rxjs';
import { PaymentError } from '../../../application/core/services/payments/error/PaymentError';
import { FrameCommunicationError } from '../message-bus/errors/FrameCommunicationError';
import { IMessageBusEvent } from '../../../application/core/models/IMessageBusEvent';
import { CONTROL_FRAME_IFRAME, MERCHANT_PARENT_FRAME } from '../../../application/core/models/constants/Selectors';
import { EventScrubber } from './EventScrubber';
import { JwtMasker } from './JwtMasker';
import { ErrorTag } from './ErrorTag';
import { RequestTimeoutError } from './RequestTimeoutError';
import { MisconfigurationError } from './MisconfigurationError';

describe('EventScrubber', () => {
  let eventScrubber: EventScrubber;
  let jwtMaskerMock: JwtMasker;

  beforeEach(() => {
    jwtMaskerMock = mock(JwtMasker);

    when(jwtMaskerMock.mask(anything())).thenReturn('jwt=*****' as any);
    eventScrubber = new EventScrubber(instance(jwtMaskerMock));
  });

  it('masks the jtw in the config-provider in extras', () => {
    const event: Event = {
      extra: {
        config: {
          jwt: 'some-long-jwt-value',
          foo: 'bar',
        },
      },
    };

    const { config } = eventScrubber.scrub(event).extra;

    expect(config).toEqual({
      jwt: '*****',
      foo: 'bar',
    });
  });

  it.each([
    [new TimeoutError(), ErrorTag.TIMEOUT],
    [new RequestTimeoutError(), ErrorTag.TIMEOUT],
    [new MisconfigurationError(), ErrorTag.MISCONFIGURATION],
    [PaymentError.duringInit('', ''), ErrorTag.PAYMENT_INIT],
    [PaymentError.duringProcess('', ''), ErrorTag.PAYMENT],
    [new FrameCommunicationError('', null, '', ''), ErrorTag.INTERNAL],
  ])('adds propert tags to different kinds of errors', (error, tag) => {
    const event: Event = { tags: {}, extra: {} };
    const hint: EventHint = {
      originalException: error,
    };

    expect(eventScrubber.scrub(event, hint).tags).toMatchObject({ tag });
  });

  describe('originalError feature', () => {
    const originalError = new Error('failure');

    it.each([
      new RequestTimeoutError('timeout', { originalError }),
      new MisconfigurationError('misconfiguration', originalError),
    ])('adds previousError data to extras from RequestTimeoutError', (error) => {
      const event: Event = { tags: {}, extra: {} };
      const hint: EventHint = {
        originalException: error,
      };

      expect(eventScrubber.scrub(event, hint).extra).toMatchObject({ originalError });
    });
  });

  it('adds errorData and paymentMethodName to extras from PaymentError', () => {
    const event: Event = { tags: {}, extra: {} };
    const errorData = { foo: 'bar' };
    const paymentMethodName = 'foobar';
    const hint: EventHint = {
      originalException: PaymentError.duringInit('', paymentMethodName, errorData),
    };

    expect(eventScrubber.scrub(event, hint).extra).toMatchObject({ errorData, paymentMethodName });
  });

  it('adds extra information to event from FrameCommunicationError', () => {
    document.write('<iframe name="foo" src="https://foo.com"></iframe><iframe name="bar" src="https://bar.com"></iframe>');

    const event: Event = { tags: {}, extra: {} };
    const messageBusEvent: IMessageBusEvent = { type: 'foo', data: 'bar' };
    const originalError = new Error('failed');
    const hint: EventHint = {
      originalException: new FrameCommunicationError(
        '',
        messageBusEvent,
        MERCHANT_PARENT_FRAME,
        CONTROL_FRAME_IFRAME,
        originalError,
      ),
    };

    const scrubbed = eventScrubber.scrub(event, hint);

    expect(scrubbed.extra).toMatchObject({
      sourceFrame: MERCHANT_PARENT_FRAME,
      targetFrame: CONTROL_FRAME_IFRAME,
      event: messageBusEvent,
      originalError,
      documentFrames: [
        { name: 'foo', src: 'https://foo.com/' },
        { name: 'bar', src: 'https://bar.com/' },
      ],
    });
  });
});
