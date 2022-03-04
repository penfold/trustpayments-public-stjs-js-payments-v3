import JwtDecode from 'jwt-decode';
import { ContainerInstance } from 'typedi';
import { anything, deepEqual, instance as mockInstance, mock, verify, when } from 'ts-mockito';
import { PUBLIC_EVENTS } from '../../models/constants/EventTypes';
import { MessageBusToken, TranslatorToken } from '../../../../shared/dependency-injection/InjectionTokens';
import { ITranslator } from '../../shared/translator/ITranslator';
import { COMMUNICATION_ERROR_INVALID_RESPONSE } from '../../models/constants/Translations';
import { JwtDecoder } from '../../../../shared/services/jwt-decoder/JwtDecoder';
import { SentryService } from '../../../../shared/services/sentry/SentryService';
import { IResponseData } from '../../models/IResponseData';
import { IDecodedJwt } from '../../models/IDecodedJwt';
import { EventScope } from '../../models/constants/EventScope';
import { ValidationFactory } from '../../shared/validation/ValidationFactory';
import { Validation } from '../../shared/validation/Validation';
import { SimpleMessageBus } from '../../shared/message-bus/SimpleMessageBus';
import { TranslatorWithMerchantTranslations } from '../../shared/translator/TranslatorWithMerchantTranslations';
import { NotificationService } from '../../../../client/notification/NotificationService';
import { IResponsePayload } from './interfaces/IResponsePayload';
import { GatewayError } from './GatewayError';
import { StCodec } from './StCodec';

describe('instance class', () => {

  describe('instance.verifyResponseObject()', () => {
    const { instance } = instanceFixture();
    beforeEach(() => {

      (instance as any).isInvalidResponse = jest.fn();
      (instance as any).handleInvalidResponse = jest.fn();
      (instance as any).determineResponse = jest.fn();
      (instance as any).handleValidGatewayResponse = jest.fn();
    });

    it('handles a valid response', () => {
      (instance as any).isInvalidResponse.mockReturnValueOnce(false);
      (instance as any).determineResponse.mockReturnValueOnce({ determined: 'response' });
      expect((instance as any).verifyResponseObject({ 'a response': 'some data' } as unknown as IResponsePayload, 'ajwtstring')).toMatchObject({
        determined: 'response',
      });

      expect((instance as any).isInvalidResponse).toHaveBeenCalledTimes(1);
      expect((instance as any).determineResponse).toHaveBeenCalledTimes(1);
      expect((instance as any).handleValidGatewayResponse).toHaveBeenCalledTimes(1);
    });

    it('handles an invalid response', () => {
      (instance as any).isInvalidResponse.mockReturnValueOnce(true);
      (instance as any).handleInvalidResponse.mockReturnValue(new Error('Uh oh!'));
      expect(() => (instance as any).verifyResponseObject({ 'a response': 'some data' } as unknown as IResponsePayload, 'ajwtstring')).toThrow(
        new Error('Uh oh!')
      );
      expect((instance as any).isInvalidResponse).toHaveBeenCalledTimes(1);
      expect((instance as any).handleInvalidResponse).toHaveBeenCalledTimes(1);
    });
  });

  describe('instance.publishResponse()', () => {
    const { instance } = instanceFixture();
    beforeEach(() => {
      (instance as any).messageBus.publish = jest.fn();
    });

    it('should translate and publish result', () => {
      instance.publishResponse({
        errorcode: '0',
        errormessage: 'Payment has been successfully processed',
      });

      expect((instance as any).messageBus.publish).toHaveBeenCalledWith(
        {
          data: {
            errorcode: '0',
            errormessage: 'Payment has been successfully processed',
          },
          type: 'TRANSACTION_COMPLETE',
        },
        EventScope.ALL_FRAMES
      );
    });

    it('should assing jwtResponse to eventData.jwt when it is defined', () => {
      instance.publishResponse(
        {
          errorcode: '0',
          errormessage: 'Ok',
        },
        'someJwtResponse'
      );
      // @ts-ignore
      expect(instance.messageBus.publish).toHaveBeenCalledTimes(1);
    });

    it('should assing threedresponse  to eventData.threedresponse  when it is defined', () => {
      instance.publishResponse(
        {
          errorcode: '0',
          errormessage: 'Ok',
        },
        'someJwtResponse',
      );

      expect((instance as any).messageBus.publish).toHaveBeenCalledTimes(1);
    });
  });

  describe('instance.createCommunicationError()', () => {
    it('return valid error response', () => {
      const { instance } = instanceFixture();
      // @ts-ignore
      expect(instance.createCommunicationError()).toMatchObject({
        errorcode: '50003',
        errormessage: 'Invalid response',
      });
    });
  });

  describe('instance.handleInvalidResponse()', () => {
    const { instance } = instanceFixture();
    it('should call publishResponse and error notification and return the error object', () => {
      const spy1 = jest.spyOn(instance, 'publishResponse');
      // @ts-ignore
      const spy2 = jest.spyOn(instance.notificationService, 'error');
      // @ts-ignore
      expect(instance.handleInvalidResponse()).toMatchObject(new Error(COMMUNICATION_ERROR_INVALID_RESPONSE));
      expect(spy1).toHaveBeenCalledTimes(1);
       expect(spy1).toHaveBeenCalledWith({ errorcode: '50003', errormessage: 'Invalid response' });
      expect(spy2).toHaveBeenCalledTimes(1);
      expect(spy2).toHaveBeenCalledWith(COMMUNICATION_ERROR_INVALID_RESPONSE);
    });
  });

  describe('instance.determineResponse()', () => {
    const { instance } = instanceFixture();
    it.each([
      [{ response: [{ requesttypedescription: 'AUTH' }] }, { requesttypedescription: 'AUTH' }],
      [
        { response: [{ requesttypedescription: 'AUTH' }, { requesttypedescription: 'CHARGEBACK' }] },
        { requesttypedescription: 'CHARGEBACK' },
      ],
      [
        {
          response: [
            { requesttypedescription: 'AUTH', customeroutput: 'RESULT' },
            { requesttypedescription: 'CHARGEBACK' },
          ],
        },
        { requesttypedescription: 'AUTH', customeroutput: 'RESULT' },
      ],
      [
        {
          response: [
            { requesttypedescription: 'AUTH', customeroutput: 'RESULT' },
            { requesttypedescription: 'RISKDEC' },
            { requesttypedescription: 'CHARGEBACK' },
          ],
        },
        { requesttypedescription: 'AUTH', customeroutput: 'RESULT' },
      ],
      [
        {
          response: [
            { requesttypedescription: 'AUTH' },
            { requesttypedescription: 'RISKDEC', customeroutput: 'RESULT' },
            { requesttypedescription: 'CHARGEBACK' },
          ],
        },
        { requesttypedescription: 'RISKDEC', customeroutput: 'RESULT' },
      ],
    ])('should return a valid response', (requestObject, expected) => {
      // @ts-ignore
      expect(instance.determineResponse(requestObject)).toEqual(expected);
    });
  });

  describe('instance.handleValidGatewayResponse()', () => {
    const { instance, sentryServiceMock } = instanceFixture();
    const originalPublishResponse = instance.publishResponse;
    // @ts-ignore
    const originalGetErrorData = instance.getErrorData;

    beforeEach(() => {
      instance.publishResponse = jest.fn();
      // @ts-ignore
      instance.getErrorData = jest.fn((data: IResponseData) => originalGetErrorData(data));
      // @ts-ignore
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      instance.publishResponse = originalPublishResponse;
      // @ts-ignore
      instance.getErrorData = originalGetErrorData;
    });

    it('should handle successful response', () => {
      const content = { errorcode: '0', errormessage: 'Ok', requesttypedescription: 'AUTH' };
      const jwt = 'jwtString';
      // @ts-ignore
      instance.handleValidGatewayResponse(content, jwt);
      expect(instance.publishResponse).toHaveBeenCalledWith(content, jwt);
      expect(content.errormessage).toBe('Ok');
    });

    it('should handle invalid field error and send error to sentry', () => {
      const content = { errorcode: '30000', errormessage: 'Invalid field', errordata: ['jwt'], requesttypedescription: 'AUTH' };
      const jwt = 'jwtString';

      try {
        // @ts-ignore
        instance.handleValidGatewayResponse(content, jwt);
      } catch (e) {
        verify(sentryServiceMock.sendCustomMessage(
          deepEqual(new GatewayError('Gateway error - Invalid field', content)))
        ).once();
      }
    });
  });

  describe('instance.decodeResponseJwt()', () => {
    const { instance } = instanceFixture();
    it('should return decoded JWT payload', () => {
      const jwt =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJwYXlsb2FkIjp7InNvbWV0aGluZyI6InRoYXRzIGRlY29kZWQifX0.OCxORAco0sqzWR1nd4-MUajfrAHGgGSf4d_AAjmrNlU';
      const mock = jest.fn();
      // @ts-ignore
      const resp = instance.decodeResponseJwt(jwt, mock);
      expect(resp).toMatchObject({
        iat: 1516239022,
        name: 'John Doe',
        payload: { something: 'thats decoded' },
        sub: '1234567890',
      });
      expect(mock).toHaveBeenCalledTimes(0);
    });

    it('should call reject on failure', () => {
      const jwt = 'INVALID';
      const mock = jest.fn();
      // @ts-ignore
      instance.decodeResponseJwt(jwt, mock);
      expect(mock).toHaveBeenCalledTimes(1);
      expect(mock).toHaveBeenCalledWith(new Error(COMMUNICATION_ERROR_INVALID_RESPONSE));
    });
  });

  describe('instance.createRequestId()', () => {
    const { instance, requestid } = instanceFixture();
    it('generates a request id', () => {
      // @ts-ignore
      expect(instance.createRequestId()).toEqual(requestid);
    });

    it('generates reasonably unique ids', () => {
      const attempts = 99999;
      const results = new Set();
      for (let i = 0; i < attempts; i++) {
        // @ts-ignore
        results.add(instance.createRequestId());
      }
      expect(results.size).toEqual(attempts);
    });
  });

  describe('buildRequestObject()', () => {
    const { instance, jwt, requestid } = instanceFixture();
    beforeEach(() => {
      instance.VERSION_INFO = 'STJS::N/A::2.0.0::N/A';
      // @ts-ignore
      instance.publishResponse = jest.fn();
    });

    it.each([
      [
        { pan: '4111111111111111', expirydate: '12/12', securitycode: '321' },
        { pan: '4111111111111111', expirydate: '12/12', securitycode: '321', sitereference: 'live2' },
      ],
      [
        {
          requestid: 'number1',
          requesttypedescriptions: ['CACHETOKENISE'],
        },
        { requesttypedescriptions: ['CACHETOKENISE'], sitereference: 'live2' },
      ],
    ])('should build the request for a valid object', (requestObject, expected) => {
      expect(instance.buildRequestObject(requestObject)).toEqual({
        acceptcustomeroutput: '2.00',
        jwt,
        request: [{ requestid, ...expected }],
        version: instance.VERSION,
        versioninfo: 'STJS::N/A::2.0.0::N/A',
      });
    });
  });

  describe('encode()', () => {
    const { instance, jwt, ridRegex } = instanceFixture();
    beforeEach(() => {
      instance.VERSION_INFO = 'STJS::N/A::2.0.0::N/A';
      instance.publishResponse = jest.fn();
    });

    it.each([
      [
        { pan: '4111111111111111', requesttypedescriptions: ['AUTH'] },
        expect.stringMatching(
          new RegExp(
            '^{"acceptcustomeroutput":"2.00","jwt":"' +
              jwt +
              '","request":\\[{"pan":"4111111111111111","requesttypedescriptions":\\["AUTH"\\],"requestid":"' +
              ridRegex +
              '","sitereference":"live2"}\\],"version":"1.00","versioninfo":"STJS::N/A::2.0.0::N/A"}$'
          )
        ),
      ],
      [
        { pan: '4111111111111111', requesttypedescriptions: ['AUTH', 'SUBSCRIPTION'] },
        expect.stringMatching(
          new RegExp(
            '^{"acceptcustomeroutput":"2.00","jwt":"' +
              jwt +
              '","request":\\[{"pan":"4111111111111111",' +
              '"requesttypedescriptions":\\["AUTH","SUBSCRIPTION"\\],"requestid":"' +
              ridRegex +
              '","sitereference":"live2"}\\],"version":"1.00","versioninfo":"STJS::N/A::2.0.0::N/A"}$'
          )
        ),
      ],
    ])('should encode valid data', (request, expected) => {
      instance.buildRequestObject = jest.fn(instance.buildRequestObject);
      expect(instance.encode(request)).toEqual(expected);
      expect(instance.buildRequestObject).toHaveBeenCalledWith(request);
    });
  });

  describe('instance.isInvalidResponse()', () => {
    const { instance } = instanceFixture();
    beforeEach(() => {
      (instance as any).publishResponse = jest.fn();
    });

    it.each([
      [{}, true],
      [{ response: [{}] }, true],
      [{ version: '3.02' }, true],
      [{ version: '1.00', response: [] }, true],
      [{ version: '1.00', response: [{}] }, false],
      [{ version: '1.00', response: [{}, {}] }, false],
    ])('should verify the version and number of responses', (responseData: IResponsePayload, expected) => {

      expect((instance.isInvalidResponse(responseData))).toBe(expected);
    });
  });

  describe('decode()', () => {
    const { instance, fullResponse } = instanceFixture();
    beforeEach(() => {
      (instance as any).handleInvalidResponse = jest.fn().mockReturnValueOnce(Error(COMMUNICATION_ERROR_INVALID_RESPONSE));
    });

    it('should decode a valid response', async () => {
      (instance as any).verifyResponseObject = jest.fn().mockReturnValueOnce({ verified: 'data' });
      await expect(
        instance.decode({
          json: () => {
            return new Promise(resolve => resolve(fullResponse));
          },
        })
      ).resolves.toEqual({ jwt: fullResponse.jwt, requestreference: 'W33-0rm0gcyx', response: { verified: 'data' } });
      const expectedResult = (JwtDecode(fullResponse.jwt) as unknown as IDecodedJwt).payload;
      expect( (instance as any).verifyResponseObject).toHaveBeenCalledWith(expectedResult, fullResponse.jwt);
    });

    it('should error an invalid response', async () => {
      await expect(instance.decode({})).rejects.toThrow(Error(COMMUNICATION_ERROR_INVALID_RESPONSE));
      // @ts-ignore
      expect(instance.handleInvalidResponse).toHaveBeenCalledTimes(1);
    });

    it('should reset the jwt in instance on error', done => {
      // @ts-ignore
      instance.verifyResponseObject = jest.fn().mockImplementation(() => {
        throw new GatewayError();
      });

      instance.jwt = 'jwt';
      // @ts-ignore
      instance.originalJwt = 'original_jwt';

      instance.decode({
        json: () => {
          return new Promise(resolve => resolve(fullResponse));
        },
      });

      setTimeout(() => {
        expect(instance.jwt).toEqual('original_jwt');
        done();
      });
    });
  });

  describe('instance.updateJwt()', () => {
    const { instance } = instanceFixture();

    beforeEach(() => {
      const { instance } = instanceFixture();
      (instance as any).messageBus.publish = jest.fn();

    });

    it('should set the current jwt and originalJwt', () => {
      instance.updateJwt('somenewjwt');
      expect(instance.jwt).toEqual('somenewjwt');
      expect((instance as any).originalJwt).toEqual('somenewjwt');
    });

  });

  describe('instance.resetJwt()', () => {
    const { instance } = instanceFixture();
    beforeEach(() => {
      // @ts-ignore
      (instance as any).messageBus.publish = jest.fn();
      instance.jwt = 'currentjwt';
      // @ts-ignore
      instance.originalJwt = 'originaljwt';
      instance.resetJwt();
    });

    it('should replace the current jwt with original jwt', () => {
      expect(instance.jwt).toEqual('originaljwt');
    });

    it('should send the JWT_RESET event', () => {
      // @ts-ignore
      expect((instance as any).messageBus.publish).toHaveBeenCalledWith({ type: PUBLIC_EVENTS.JWT_RESET });
    });
  });

  describe('instance.replaceJwt()', () => {
    const { instance } = instanceFixture();
    beforeEach(() => {
      // @ts-ignore
      (instance as any).messageBus.publish = jest.fn();
      instance.jwt = 'currentjwt';
      // @ts-ignore
      instance.originalJwt = 'originaljwt';
      // @ts-ignore
      instance.replaceJwt('newjwt');
    });

    it('should replace the current jwt with the new jwt', () => {
      expect(instance.jwt).toEqual('newjwt');
    });

    it('should send the JWT_REPLACED event', () => {
      // @ts-ignore
      expect((instance as any).messageBus.publish).toHaveBeenCalledWith({
        type: PUBLIC_EVENTS.JWT_REPLACED,
        data: 'newjwt',
      });
    });
  });
});

function instanceFixture() {
  const jwtDecoder: JwtDecoder = mock<JwtDecoder>();
  const validationFactory: ValidationFactory = mock(ValidationFactory);
  const translatorToken: ITranslator = mock(TranslatorWithMerchantTranslations);
  const sentryServiceMock: SentryService = mock(SentryService);
  const container: ContainerInstance = mock(ContainerInstance);
  const notification: NotificationService = mock(NotificationService);
  const testMessageBus = new SimpleMessageBus();

  when(jwtDecoder.decode(anything())).thenReturn({ payload: { locale: 'en_GB' }, sitereference: 'live2' });

  when(container.get(MessageBusToken)).thenReturn(testMessageBus);
  when(container.get(TranslatorToken)).thenReturn(mockInstance(translatorToken));

  const jwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJsaXZlMl9hdXRvand0IiwiaWF0IjoxNTUzMjcwODAwLCJwYXlsb2FkIjp7ImJhc2VhbW91bnQiOiIxMDAwIiwiY3VycmVuY3lpc28zYSI6IkdCUCIsInNpdGVyZWZlcmVuY2UiOiJsaXZlMiIsImFjY291bnR0eXBlZGVzY3JpcHRpb24iOiJFQ09NIn19.SGLwyTcqh6JGlrgzEabOLvCWRx_jeroYk67f_xSQpLM';
  const ridRegex = 'J-[\\da-z]{8}';
  const requestid = expect.stringMatching(new RegExp('^' + ridRegex + '$'));

  const fullResponse = {
    jwt:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1NjExMTUyMDksInBheWxvYWQiOnsicmVxdWVzdHJlZmVyZW5jZSI6IlczMy0wcm0wZ2N5eCIsInJlc3BvbnNlIjpbeyJhY2NvdW50dHlwZWRlc2NyaXB0aW9uIjoiRUNPTSIsImFjcXVpcmVycmVzcG9uc2Vjb2RlIjoiMDAiLCJhdXRoY29kZSI6IlRFU1Q1NiIsImJhc2VhbW91bnQiOiIxMDAiLCJjdXJyZW5jeWlzbzNhIjoiR0JQIiwiZGNjZW5hYmxlZCI6IjAiLCJlcnJvcmNvZGUiOiIwIiwiZXJyb3JtZXNzYWdlIjoiT2siLCJpc3N1ZXIiOiJTZWN1cmVUcmFkaW5nIFRlc3QgSXNzdWVyMSIsImlzc3VlcmNvdW50cnlpc28yYSI6IlVTIiwibGl2ZXN0YXR1cyI6IjAiLCJtYXNrZWRwYW4iOiI0MTExMTEjIyMjIyMwMjExIiwibWVyY2hhbnRjb3VudHJ5aXNvMmEiOiJHQiIsIm1lcmNoYW50bmFtZSI6IndlYnNlcnZpY2UgVU5JQ09ERSBtZXJjaGFudG5hbWUiLCJtZXJjaGFudG51bWJlciI6IjAwMDAwMDAwIiwib3BlcmF0b3JuYW1lIjoid2Vic2VydmljZXNAc2VjdXJldHJhZGluZy5jb20iLCJvcmRlcnJlZmVyZW5jZSI6IkFVVEhfVklTQV9QT1NULVBBU1MtSlNPTi1KU09OIiwicGF5bWVudHR5cGVkZXNjcmlwdGlvbiI6IlZJU0EiLCJyZXF1ZXN0dHlwZWRlc2NyaXB0aW9uIjoiQVVUSCIsInNlY3VyaXR5cmVzcG9uc2VhZGRyZXNzIjoiMiIsInNlY3VyaXR5cmVzcG9uc2Vwb3N0Y29kZSI6IjIiLCJzZWN1cml0eXJlc3BvbnNlc2VjdXJpdHljb2RlIjoiMiIsInNldHRsZWR1ZWRhdGUiOiIyMDE5LTAyLTIxIiwic2V0dGxlc3RhdHVzIjoiMCIsInNwbGl0ZmluYWxudW1iZXIiOiIxIiwidGlkIjoiMjc4ODI3ODgiLCJ0cmFuc2FjdGlvbnJlZmVyZW5jZSI6IjMzLTktODAxNjgiLCJ0cmFuc2FjdGlvbnN0YXJ0ZWR0aW1lc3RhbXAiOiIyMDE5LTAyLTIxIDEwOjA2OjM1In1dLCJzZWNyYW5kIjoiWktBVk1za1dRIiwidmVyc2lvbiI6IjEuMDAifX0.lLHIs5UsXht0IyFCGEF_x7AM4u_lOWX47J5cCuakqtc',
  };
  const mockValidation: Validation = mock(Validation);

  // Container.get(TranslatorToken).init();

  when(jwtDecoder.decode(anything())).thenReturn({ payload: { locale: 'en_GB' }, sitereference: 'live2' });
  when(validationFactory.create()).thenReturn(mockInstance(mockValidation))

  const instance: StCodec = new StCodec(mockInstance(jwtDecoder), jwt,mockInstance(validationFactory), mockInstance(container), mockInstance(notification), mockInstance(sentryServiceMock));

  return { jwt, instance, fullResponse, requestid, ridRegex, sentryServiceMock };
}
