import { instance, mock, when } from 'ts-mockito';
import { of } from 'rxjs';
import { eventExceptionMockGenerator, MOCKED_ERROR_LIST } from '../SentryEventFiltering/SentryEventFiltering.mock';
import { ErrorTypeName } from '../constants/ErrorTypeName';
import { ErrorTag } from '../constants/ErrorTag';
import { MisconfigurationError } from '../errors/MisconfigurationError';
import { Store } from '../../../../application/core/store/store/Store';
import { IStore } from '../../../../application/core/store/IStore';
import { IApplicationFrameState } from '../../../../application/core/store/state/IApplicationFrameState';
import { CommonState } from '../../../../application/core/store/reducers/initial-config/InitialConfigReducer';
import { FrameCommunicationError } from '../../message-bus/errors/FrameCommunicationError';
import { PaymentError } from '../../../../application/core/services/payments/error/PaymentError';
import { PayloadSanitizer } from '../PayloadSanitizer/PayloadSanitizer';
import { SentryEventExtender } from './SentryEventExtender';

describe('SentryEventExtender', () => {
  let sentryEventExtender: SentryEventExtender;
  let payloadSanitizer: PayloadSanitizer;
  let randomEvent = eventExceptionMockGenerator();
  let storeMock: IStore<IApplicationFrameState>;
  const originalErrorMock = MOCKED_ERROR_LIST[ErrorTypeName.Error];
  const misconfigurationError = new MisconfigurationError(undefined, originalErrorMock);
  let statePayload: CommonState;
  const expectedJWT =   {
    iat: 1592298893548,
    iss: '***',
    payload: {
    baseamount: '60010',
      accounttypedescription: 'ECOM',
      currencyiso3a: 'GBP',
      sitereference: 'ddd',
  },
  }

  const testCases = [
    ...Object.entries(MOCKED_ERROR_LIST).map(([errorName, error]) => {
      const newEvent = eventExceptionMockGenerator();
      const expectedEvent = { ...newEvent };

      if(error instanceof FrameCommunicationError) {
        expectedEvent.extra = {
          ...expectedEvent.extra,
          documentFrames: [],
          event: null,
          originalError: undefined,
          sourceFrame: null,
          targetFrame: null,
        };
      }

      if(error instanceof PaymentError){
        expectedEvent.extra = {
          ...expectedEvent.extra,
          paymentMethodName: null,
          errorData: undefined,
        };
      }

      return {
        params: { event: { ...newEvent }, error: error },
        expected: { event: { ...expectedEvent } },
        message: `event anything for ${errorName}`,
      };
    }),
    {
      params: { event: { ...randomEvent }, error: MOCKED_ERROR_LIST[ErrorTypeName.TimeoutError] },
      expected: { event: { ...randomEvent, tags: { tag: ErrorTag.TIMEOUT } } },
      message: `event with tag ${ErrorTag.TIMEOUT}`,
    },

    {
      params: { event: { ...randomEvent }, error: misconfigurationError },
      expected: { event: { ...randomEvent, extra: { originalError: originalErrorMock }, tags: { tag: ErrorTag.MISCONFIGURATION } } },
      message: `event with tag ${ErrorTag.MISCONFIGURATION} and originalError`,
    },
  ];

  beforeEach(() => {

    statePayload = {
      jwt: 'somejwt',
      storage: {},
      initialConfig: {},
      config: {
        jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2NTY1OTUwODcsImlzcyI6ImRkZCIsInBheWxvYWQiOnsiYmFzZWFtb3VudCI6IjYwMDEwIiwiYWNjb3VudHR5cGVkZXNjcmlwdGlvbiI6IkVDT00iLCJjdXJyZW5jeWlzbzNhIjoiR0JQIiwic2l0ZXJlZmVyZW5jZSI6ImRkZCJ9fQ.xT_CJmDlhoasrztqHUAePm3dN6_3ZaSHPPRyBlkoiFo',
      },
      sentryData: {
        currentRequestId: 'foo',
        currentResponseId: 'bar',
      },
    };

    storeMock = mock(Store);
    payloadSanitizer = mock(PayloadSanitizer);
    when(storeMock.getState()).thenReturn(statePayload);
    when(payloadSanitizer.maskSensitiveJwtFields(statePayload.config.jwt)).thenReturn(expectedJWT);

    sentryEventExtender = new SentryEventExtender(instance(storeMock), instance(payloadSanitizer));

    randomEvent = eventExceptionMockGenerator();

  });

  describe.each(testCases)('Test cases', (testCase) => {

    it(`Should return ${testCase.message}`, (done) => {
      of(testCase.params).pipe(sentryEventExtender.extendEvent()).subscribe((value) => {
        const expectedEvent = testCase.expected.event;
        expectedEvent.extra.config = statePayload.config;
        expectedEvent.extra.jwt = expectedJWT;
        expectedEvent.extra.initialConfig = statePayload.initialConfig;
        expectedEvent.extra.transactionReference = {
          requestId: statePayload.sentryData.currentRequestId,
          responseId: statePayload.sentryData.currentResponseId,
        };
        expect(value.event).toEqual(expectedEvent);
        done();
      });

    });
  });

});

