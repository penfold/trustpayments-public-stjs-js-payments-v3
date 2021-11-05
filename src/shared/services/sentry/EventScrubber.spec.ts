import { Event, EventHint } from '@sentry/types';
import { anything, instance, mock, when } from 'ts-mockito';
import { GatewayError } from '../../../application/core/services/st-codec/GatewayError';
import { EventScrubber } from './EventScrubber';
import { JwtMasker } from './JwtMasker';

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

  it('filters out gateway errors', () => {
    const event: Event = {};
    const hint: EventHint = {
      originalException: new GatewayError(),
    };

    expect(eventScrubber.scrub(event, hint)).toBeNull();
  });
});
