import { Event } from '@sentry/types';
import { anything, instance, mock,when } from 'ts-mockito';
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
});
