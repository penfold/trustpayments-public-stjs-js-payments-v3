import { ErrorTypeName } from '../constants/ErrorTypeName';
import { ErrorFilter } from './SentryEventFiltering.model';

export const SENTRY_EXCEPTION_MESSAGE_LIST: string[] =[
  'InvalidTokenError',
  'Invalid JWT',
  'JSON.parse: unexpected character',
  'Invalid response',
  'e.captureSession is not a function',
  'NS_ERROR_NOT_INITIALIZED',
  'Non-Error promise rejection captured with keys: message',
  'postMessage is not a function',
  'Cannot read property \'frames\' of null',
  'Trying to start an Apple Pay session from a document with an different security origin than its top-level frame.',
]

export const SENTRY_EVENT_FILTERING_CONFIG: ErrorFilter[] = [
  {
    id: 0,
    description: 'Exclude dev environment & userId not containing "test_"',
    filters: {
      environment: [
        {
        pattern: 'dev',
        expected: true,
        },
      ],
      userId: {
        pattern: 'test_',
        expected: false,
      },
    },
  },
  {
    id: 1,
    description: 'Exclude userId containing "test_" except "dev" environment (if dev && test allow)',
    filters: {
      environment: [
        {
          pattern: 'dev',
          expected: false,
        },
      ],
      userId: {
        pattern: 'test_',
        expected: true,
      },
    },
  },
  {
    id: 2,
    description: 'Exclude GatewaysErrors',
    filters: {
      errorTypeName: ErrorTypeName.GatewayError,
    },
  },
  {
    id: 3,
    description: 'Exceptions to skip',
    filters: {
     messageList: SENTRY_EXCEPTION_MESSAGE_LIST,
    },
  },
];

