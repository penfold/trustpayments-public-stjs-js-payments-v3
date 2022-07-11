import { TimeoutError } from 'rxjs';
import { GatewayError } from '../../../../application/core/services/st-codec/GatewayError';
import { RequestTimeoutError } from '../errors/RequestTimeoutError';
import { CardinalError } from '../../../../application/core/services/st-codec/CardinalError';
import { MisconfigurationError } from '../errors/MisconfigurationError';
import { PaymentError } from '../../../../application/core/services/payments/error/PaymentError';
import { FrameCommunicationError } from '../../message-bus/errors/FrameCommunicationError';

export const ErrorTypeList = {
  GatewayError,
  Error,
  TimeoutError,
  RequestTimeoutError,
  CardinalError,
  MisconfigurationError,
  PaymentError,
  FrameCommunicationError,
};
