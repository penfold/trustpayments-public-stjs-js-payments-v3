import { Event } from '@sentry/types/types/event';
import { faker } from '@faker-js/faker';
import { TimeoutError } from 'rxjs';
import { ErrorTypeName } from '../constants/ErrorTypeName';
import { CardinalError } from '../../../../application/core/services/st-codec/CardinalError';
import { GatewayError } from '../../../../application/core/services/st-codec/GatewayError';
import { FrameCommunicationError } from '../../message-bus/errors/FrameCommunicationError';
import { MisconfigurationError } from '../errors/MisconfigurationError';
import { RequestTimeoutError } from '../errors/RequestTimeoutError';
import { PaymentError } from '../../../../application/core/services/payments/error/PaymentError';

export const MOCKED_ERROR_LIST = {
  [ErrorTypeName.Error]: new Error(),
  [ErrorTypeName.CardinalError]: new CardinalError(),
  [ErrorTypeName.GatewayError]: new GatewayError(),
  [ErrorTypeName.TimeoutError]: new TimeoutError(),
  [ErrorTypeName.RequestTimeoutError]: new RequestTimeoutError(),
  [ErrorTypeName.MisconfigurationError]: new MisconfigurationError(),
  [ErrorTypeName.PaymentError]: PaymentError.duringInit(null, null),
  [ErrorTypeName.FrameCommunicationError]: new FrameCommunicationError(null, null, null, null),
};

export const randomFileNameList = (arrayLength = 5): string[] => {
  return Array(arrayLength).fill(`${faker.internet.url()}/${faker.random.word()}.js`);
};

export const eventExceptionMockGenerator = (message = faker.random.words(5),
                                            fileNameList: string[] = randomFileNameList(),
                                            environment: string = ['prod', 'dev'][Math.floor(Math.random() * 2)],
                                            url = faker.internet.url(),
                                            userId = faker.random.word()): Event => {
  return {
    environment,
    exception: {
      values: [{
        type: 'error',
        value: message,
        stacktrace: {
          frames: fileNameList.map((filename: string) => ({ filename })),
        },
      }],
    },
    tags:{},
    extra: {},
    user: { id: userId },
    request: {
      url,
    },
  };
};
