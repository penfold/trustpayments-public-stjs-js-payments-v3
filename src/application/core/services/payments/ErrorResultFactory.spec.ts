import { ErrorResultFactory } from './ErrorResultFactory';
import { IRequestTypeResponse } from '../st-codec/interfaces/IRequestTypeResponse';
import { IPaymentResult } from './IPaymentResult';
import { PaymentStatus } from './PaymentStatus';
import { PAYMENT_ERROR } from '../../models/constants/Translations';

describe('ErrorResultFactory', () => {
  let errorResultFactory: ErrorResultFactory;

  beforeAll(() => {
    errorResultFactory = new ErrorResultFactory();
  });

  describe('createResultFromError()', () => {
    it('should create an error result from gateway response obj', () => {
      const response: IRequestTypeResponse = {
        errormessage: 'some error message',
        errorcode: '12345',
        requesttypedescription: '',
        transactionstartedtimestamp: '',
        customeroutput: '',
        errordata: '',
      };

      const result = errorResultFactory.createResultFromError(response, 'Card',);
      const expectedResult: IPaymentResult<IRequestTypeResponse> = {
        status: PaymentStatus.ERROR,
        data: response,
        error: {
          code: 12345,
          message: 'some error message',
        },
        paymentMethodName: 'Card',
      };

      expect(result).toEqual(expectedResult);
    });

    it.each([
      'error',
      { foo: 'bar' },
      new Error('error'),
    ])('should create an error result from any type of data', errorData => {
      const expectedResult: IPaymentResult<typeof errorData> = {
        status: PaymentStatus.ERROR,
        data: errorData,
        error: {
          code: 50003,
          message: PAYMENT_ERROR,
        },
        paymentMethodName: 'Card',
      };

      expect(errorResultFactory.createResultFromError(errorData, 'Card')).toEqual(expectedResult);
    });
  });
});
