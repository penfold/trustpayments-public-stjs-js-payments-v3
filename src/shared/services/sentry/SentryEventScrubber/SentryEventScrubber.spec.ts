import { Event } from '@sentry/types';
import { anything, instance, mock, verify } from 'ts-mockito';
import { of } from 'rxjs';
import { JwtMasker } from '../JwtMasker/JwtMasker';
import { SentryEventScrubber } from './SentryEventScrubber';

describe('SentryEventScrubber', () => {
  let eventScrubber: SentryEventScrubber;
  let jwtMaskerMock: JwtMasker;

  beforeEach(() => {
    jwtMaskerMock = mock(JwtMasker);

    eventScrubber = new SentryEventScrubber(instance(jwtMaskerMock));
  });

  it('should mask event data', done=> {
    const event: Event = {
      extra: {
        config: {
          jwt: 'some-long-jwt-value',
          foo: 'bar',
        },
      },
      request: {
        url: 'http://some-url.com/page?jwt=jwtValue1&key2=value2 ',
        query_string: 'jwt=jwtValue1&key2=value2',
      },
    };

    of({ event, error: anything() }).pipe(eventScrubber.scrubEvent()).subscribe(()=>{
      verify(jwtMaskerMock.mask(anything())).times(3);
      done();
    })

  });
});
