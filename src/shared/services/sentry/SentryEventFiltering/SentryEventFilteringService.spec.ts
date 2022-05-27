import { anything } from 'ts-mockito';
import { BehaviorSubject, count } from 'rxjs';
import { ErrorTypeName } from '../constants/ErrorTypeName';
import { SentryEventFilteringService } from './SentryEventFilteringService';
import { eventExceptionMockGenerator, MOCKED_ERROR_LIST } from './SentryEventFiltering.mock';
import { SENTRY_EXCEPTION_MESSAGE_LIST } from './SentryEventFilteringConfig';

describe('SentryEventExceptionProcessor', () => {
  let sentryEventExceptionProcessor: SentryEventFilteringService;
  const gatewayErrorMock = MOCKED_ERROR_LIST[ErrorTypeName.GatewayError];
  const prodEnvRandomError = eventExceptionMockGenerator(undefined, undefined, 'prod');
  const devEnvAndTestUser = eventExceptionMockGenerator(undefined, undefined, 'dev', undefined, 'test_user');
  const devEnvAndNotTestUser = eventExceptionMockGenerator(undefined, undefined, 'dev', undefined, 'nottest');
  const exceptionsMessagesTest = SENTRY_EXCEPTION_MESSAGE_LIST.map((message: string) => {
    return {
      params: { event: eventExceptionMockGenerator(message), error: anything() },
      expected: { event: undefined },
      message: `null with error message: ${message}`,
    };
  });

  const testCases = [
    ...exceptionsMessagesTest,
    {
      params: { event: prodEnvRandomError, error: anything() },
      expected: { event: prodEnvRandomError },
      message: 'event for prod & random exception',
    },
    {
      params: { event: null, error: anything() },
      expected: { event: null },
      message: 'null for null event',
    },
    {
      params: { event: eventExceptionMockGenerator(), error: gatewayErrorMock },
      expected: { event: null },
      message: 'null for GatewaysErrors',
    },
    {
      params: { event: devEnvAndTestUser, error: anything() },
      expected: { event: devEnvAndTestUser },
      message: 'event user test on the dev environment',
    },
    {
      params: { event: devEnvAndNotTestUser, error: anything() },
      expected: { event: null },
      message: ' event null on the dev environment if user is not test_',
    },
  ];

  beforeEach(() => {
    sentryEventExceptionProcessor = new SentryEventFilteringService();
  });

  it('should return 2 events', (done) => {

    const observer = new BehaviorSubject(null);

    observer.pipe(
      sentryEventExceptionProcessor.filterEvent(),
      count()
    ).subscribe((value) => {
      expect(value).toBe(2);
      done();
    });

    for(const testCase of testCases){
      observer.next((testCase.params as any));
    }

    observer.complete();
  });
});
