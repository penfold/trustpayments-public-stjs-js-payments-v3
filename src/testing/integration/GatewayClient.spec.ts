import Container from 'typedi';
import { jwtgenerator } from '@trustpayments/jwt-generator';
import { StTransport } from '../../application/core/services/st-transport/StTransport.class';
import { ConfigProvider } from '../../shared/services/config-provider/ConfigProvider';
import { TestConfigProvider } from '../mocks/TestConfigProvider';
import { GatewayClient } from '../../application/core/services/GatewayClient';
import { MessageBusMock } from '../mocks/MessageBusMock';
import { MessageBus } from '../../application/core/shared/message-bus/MessageBus';

describe('GatewayClient', () => {
  const datacenterurl: string = 'https://webservices.securetrading.net/jwt/';
  const requestObject = {
    baseamount: '1000',
    accounttypedescription: 'ECOM',
    currencyiso3a: 'GBP',
    sitereference: 'test_james38641',
    termurl: 'https://termurl.com',
    pan: '4111111111111111',
    expirydate: '12/23',
    securitycode: '123'
  };
  const jwtSecretKey = 'ja<n}yP]3$1E$iUYtn_*i7))24I,=^';
  const jwtIss = 'am0310.autoapi';
  const jwtDefaultPayload = {
    baseamount: '1000',
    accounttypedescription: 'ECOM',
    currencyiso3a: 'GBP',
    sitereference: 'test_james38641'
  };

  describe('for selected request types should return a response where:', () => {
    let gatewayClient: GatewayClient;
    let testConfigProvider: TestConfigProvider;

    beforeEach(() => {
      testConfigProvider = new TestConfigProvider();
      const stTransport = new StTransport(testConfigProvider);
      const messageBus = (new MessageBusMock() as unknown) as MessageBus;
      gatewayClient = new GatewayClient(stTransport, messageBus);
    });

    test('AUTH passed, SUBSCRIPTION failed', done => {
      const testPayload = {
        requesttypedescriptions: ['AUTH', 'SUBSCRIPTION'],
        threedbypasspaymenttypes: ['VISA']
      };
      const jwt = jwtgenerator({ ...jwtDefaultPayload, ...testPayload } as any, jwtSecretKey, jwtIss);

      testConfigProvider.setConfig({ datacenterurl, jwt });
      Container.set(ConfigProvider, testConfigProvider);

      gatewayClient.jsInit().subscribe(({ cachetoken, errorcode }) => {
        if (Number(errorcode) === 0) {
          gatewayClient.threedQuery({ ...requestObject, cachetoken }).subscribe({
            next: ({ customeroutput, errordata, errorcode }) => {
              expect(customeroutput).toBe('TRYAGAIN');
              expect(errordata).toContain('subscriptionnumber');
              expect(errorcode).toBe('30000');
            },
            complete: () => done()
          });
        }
      });
    });

    test('AUTH passed, ACCOUNTCHECK failed', done => {
      const testPayload = {
        requesttypedescriptions: ['AUTH', 'ACCOUNTCHECK']
      };
      const jwt = jwtgenerator({ ...jwtDefaultPayload, ...testPayload } as any, jwtSecretKey, jwtIss);

      testConfigProvider.setConfig({ datacenterurl, jwt });
      Container.set(ConfigProvider, testConfigProvider);

      gatewayClient.jsInit().subscribe(({ cachetoken, errorcode }) => {
        if (Number(errorcode) === 0) {
          gatewayClient.threedQuery({ ...requestObject, cachetoken }).subscribe({
            next: ({ customeroutput, errordata, errorcode }) => {
              expect(customeroutput).toBeUndefined();
              expect(errordata).toContain('requesttypedescriptions');
              expect(errorcode).toBe('30000');
            },
            complete: () => done()
          });
        }
      });
    });

    test('RISKDEC / ACCOUNTCHECK / THREEDQUERY / AUTH passed', done => {
      const testPayload = {
        requesttypedescriptions: ['RISKDEC', 'ACCOUNTCHECK', 'THREEDQUERY', 'AUTH']
      };
      const jwt = jwtgenerator({ ...jwtDefaultPayload, ...testPayload } as any, jwtSecretKey, jwtIss);

      testConfigProvider.setConfig({ datacenterurl, jwt });
      Container.set(ConfigProvider, testConfigProvider);

      gatewayClient.jsInit().subscribe(({ cachetoken, errorcode }) => {
        if (Number(errorcode) === 0) {
          gatewayClient.threedQuery({ ...requestObject, cachetoken }).subscribe({
            next: response => {
              expect(response.requesttypedescription).toBe('THREEDQUERY');
              expect(response.paymenttypedescription).toBe('VISA');
              expect(response.customeroutput).toBe('THREEDREDIRECT');
              expect(response.errormessage).toBe('Payment has been successfully processed');
            },
            complete: () => done()
          });
        }
      });
    });

    test('RISKDEC / ACCOUNTCHECK / AUTH passed, THREEDQUERY bypassed, SUBSCRIPTION failed', done => {
      const testPayload = {
        requesttypedescriptions: ['RISKDEC', 'ACCOUNTCHECK', 'THREEDQUERY', 'AUTH', 'SUBSCRIPTION'],
        threedbypasspaymenttypes: ['VISA']
      };
      const jwt = jwtgenerator({ ...jwtDefaultPayload, ...testPayload } as any, jwtSecretKey, jwtIss);

      testConfigProvider.setConfig({ datacenterurl, jwt });
      Container.set(ConfigProvider, testConfigProvider);

      gatewayClient.jsInit().subscribe(({ cachetoken, errorcode }) => {
        if (Number(errorcode) === 0) {
          gatewayClient.threedQuery({ ...requestObject, cachetoken }).subscribe({
            next: response => {
              expect(response.requesttypedescription).toBe('ACCOUNTCHECK');
              expect(response.paymenttypedescription).toBe('VISA');
              expect(response.customeroutput).toBe('RESULT');
              expect(response.errormessage).toBe('Payment has been successfully processed');
            },
            complete: () => done()
          });
        }
      });
    });

    test('THREEDQUERY failed (bypass card)', done => {
      const testPayload = {
        requesttypedescriptions: ['THREEDQUERY'],
        threedbypasspaymenttypes: ['VISA']
      };
      const jwt = jwtgenerator({ ...jwtDefaultPayload, ...testPayload } as any, jwtSecretKey, jwtIss);

      testConfigProvider.setConfig({ datacenterurl, jwt });
      Container.set(ConfigProvider, testConfigProvider);

      gatewayClient.jsInit().subscribe(({ cachetoken, errorcode }) => {
        if (Number(errorcode) === 0) {
          gatewayClient.threedQuery({ ...requestObject, cachetoken }).subscribe({
            next: response => {
              expect(response.requesttypedescription).toBe('ERROR');
              expect(response.customeroutput).toBe('TRYAGAIN');
              expect(response.errorcode).toBe('22000');
              expect(response.errormessage).toBe('Bypass');
            },
            complete: () => done()
          });
        }
      });
    });
  });
});
