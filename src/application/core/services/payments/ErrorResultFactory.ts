import { IPaymentResult } from './IPaymentResult';
import { Service } from 'typedi';
import { PaymentStatus } from './PaymentStatus';
import { IRequestTypeResponse } from '../st-codec/interfaces/IRequestTypeResponse';
import { PAYMENT_ERROR } from '../../models/constants/Translations';

@Service()
export class ErrorResultFactory {
  private static readonly UNKNOWN_ERROR_CODE = 50003;
  private static readonly UNKNOWN_ERROR_MESSAGE = PAYMENT_ERROR;

  createResultFromError(error: unknown): IPaymentResult<typeof error> {
    return {
      status: PaymentStatus.ERROR,
      data: error,
      error: {
        code: this.resolveErrorCode(error),
        message: this.resolveErrorMessage(error),
      },
    };
  }

  private resolveErrorCode(error: unknown): number {
    if (this.isGatewayResponse(error)) {
      return Number(error.errorcode);
    }

    return ErrorResultFactory.UNKNOWN_ERROR_CODE;
  }

  private resolveErrorMessage(error: unknown): string {
    if (this.isGatewayResponse(error)) {
      return error.errormessage;
    }

    return ErrorResultFactory.UNKNOWN_ERROR_MESSAGE;
  }

  private isGatewayResponse(error: unknown): error is IRequestTypeResponse {
    if (typeof(error) !== 'object') {
      return false;
    }

    return (error as IRequestTypeResponse).errorcode !== undefined &&
      (error as IRequestTypeResponse).errormessage !== undefined;
  }
}
