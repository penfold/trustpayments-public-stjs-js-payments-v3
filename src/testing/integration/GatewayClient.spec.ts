import Container, { ContainerInstance } from 'typedi';
import { jwtgenerator } from '@trustpayments/jwt-generator';
import { ConfigProvider } from '../../shared/services/config-provider/ConfigProvider';
import { TestConfigProvider } from '../mocks/TestConfigProvider';
import { GatewayClient } from '../../application/core/services/GatewayClient';
import { MessageBusMock } from '../mocks/MessageBusMock';
import { MessageBus } from '../../application/core/shared/message-bus/MessageBus';
import { IResponseData } from '../../application/core/models/IResponseData';
import { WINDOW } from '../../shared/dependency-injection/InjectionTokens';
import { first, tap } from 'rxjs/operators';
import { ofType } from '../../shared/services/message-bus/operators/ofType';
import { IMessageBusEvent } from '../../application/core/models/IMessageBusEvent';
import { StCodec } from '../../application/core/services/st-codec/StCodec.class';
import { StoreBasedStorage } from '../../shared/services/storage/StoreBasedStorage';
import { SimpleStorage } from '../../shared/services/storage/SimpleStorage';
import { JwtDecoder } from '../../shared/services/jwt-decoder/JwtDecoder';
import each from 'jest-each';

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
    const jwtDecoder = new JwtDecoder();
    let gatewayClient: GatewayClient;
    let testConfigProvider: TestConfigProvider;
    let messageBus: MessageBus;

    beforeEach(() => {
      testConfigProvider = new TestConfigProvider();
      messageBus = (new MessageBusMock() as unknown) as MessageBus;
      Container.set(MessageBus, messageBus);
      Container.set(ConfigProvider, testConfigProvider);
      Container.set({ id: StoreBasedStorage, type: SimpleStorage });
      Container.set(ContainerInstance, Container.of(undefined));
      Container.set(WINDOW, window);
    });

    afterEach(() => {
      Container.reset();
      // @ts-ignore
      StCodec._messageBus = undefined;
      // @ts-ignore
      StCodec._notification = undefined;
    });

    it('AUTH passed, SUBSCRIPTION failed', done => {
      const testPayload = {
        requesttypedescriptions: ['AUTH', 'SUBSCRIPTION'],
        threedbypasspaymenttypes: ['VISA'],
        subscriptiontype: 'RECURRING',
        subscriptionunit: 'MONTH',
        subscriptionnumber: '1'
      };
      const jwt = jwtgenerator({ ...jwtDefaultPayload, ...testPayload } as any, jwtSecretKey, jwtIss);

      testConfigProvider.setConfig({ datacenterurl, jwt });
      gatewayClient = Container.get(GatewayClient);

      messageBus
        .pipe(ofType('TRANSACTION_COMPLETE'), first())
        .subscribe((response: IMessageBusEvent<IResponseData>) => {
          const { customeroutput, errorcode, jwt } = response.data;
          const { payload } = jwtDecoder.decode(jwt);
          expect(customeroutput).toBe('RESULT');
          expect(errorcode).toBe('0');
          expect(payload.response[1].errordata).toContain('subscriptionfrequency');
          done();
        });

      gatewayClient
        .jsInit()
        .pipe(first())
        .subscribe(({ cachetoken, errorcode }) => {
          if (Number(errorcode) === 0) {
            gatewayClient.threedQuery({ ...requestObject, cachetoken } as any);
          }
        });
    });

    it('AUTH passed, ACCOUNTCHECK failed', done => {
      const testPayload = {
        requesttypedescriptions: ['AUTH', 'ACCOUNTCHECK']
      };
      const jwt = jwtgenerator({ ...jwtDefaultPayload, ...testPayload } as any, jwtSecretKey, jwtIss);

      testConfigProvider.setConfig({ datacenterurl, jwt });
      gatewayClient = Container.get(GatewayClient);

      messageBus
        .pipe(ofType('TRANSACTION_COMPLETE'), first())
        .subscribe((response: IMessageBusEvent<IResponseData>) => {
          const { customeroutput, errordata, errorcode } = response.data;
          done();
        });

      gatewayClient
        .jsInit()
        .pipe(first())
        .subscribe(({ cachetoken, errorcode }) => {
          if (Number(errorcode) === 0) {
            gatewayClient.threedQuery({ ...requestObject, cachetoken } as any);
          }
        });

      // setTimeout(done, 5000);
    });

    it('RISKDEC / ACCOUNTCHECK / THREEDQUERY / AUTH passed', done => {
      const testPayload = {
        requesttypedescriptions: ['RISKDEC', 'ACCOUNTCHECK', 'THREEDQUERY', 'AUTH']
      };
      const jwt = jwtgenerator({ ...jwtDefaultPayload, ...testPayload } as any, jwtSecretKey, jwtIss);

      testConfigProvider.setConfig({ datacenterurl, jwt });
      gatewayClient = Container.get(GatewayClient);

      messageBus.pipe(ofType('TRANSACTION_COMPLETE'), first()).subscribe(response => {
        const { payload } = jwtDecoder.decode(response.data.jwt);
        let requestTypesCounter = 0;
        payload.response.forEach((response: any) => {
          const { requesttypedescription } = response;
          const condition =
            requesttypedescription === 'RISKDEC' ||
            requesttypedescription === 'ACCOUNTCHECK' ||
            requesttypedescription === 'THREEDQUERY';

          if (condition) {
            requestTypesCounter++;
          }
        });

        expect(requestTypesCounter).toBe(3);
        done();
      });

      gatewayClient
        .jsInit()
        .pipe(first())
        .subscribe(({ cachetoken, errorcode }) => {
          if (Number(errorcode) === 0) {
            gatewayClient.threedQuery({ ...requestObject, cachetoken } as any);
          }
        });
    });

    it('RISKDEC / ACCOUNTCHECK / AUTH passed, THREEDQUERY bypassed, SUBSCRIPTION failed', done => {
      const testPayload = {
        requesttypedescriptions: ['RISKDEC', 'ACCOUNTCHECK', 'THREEDQUERY', 'AUTH', 'SUBSCRIPTION'],
        threedbypasspaymenttypes: ['VISA'],
        subscriptiontype: 'RECURRING',
        subscriptionunit: 'MONTH',
        subscriptionnumber: '1'
      };
      const jwt = jwtgenerator({ ...jwtDefaultPayload, ...testPayload } as any, jwtSecretKey, jwtIss);

      testConfigProvider.setConfig({ datacenterurl, jwt });
      gatewayClient = Container.get(GatewayClient);

      messageBus.pipe(ofType('TRANSACTION_COMPLETE'), first()).subscribe(response => {
        const { payload } = jwtDecoder.decode(response.data.jwt);
        let requestTypesCounter = 0;

        payload.response.forEach((response: any) => {
          const { requesttypedescription } = response;
          const condition = requesttypedescription === 'RISKDEC' || requesttypedescription === 'ACCOUNTCHECK';

          if (requesttypedescription === 'SUBSCRIPTION') {
            expect(response.errordata).toContain('subscriptionfrequency');
          }

          if (condition) {
            requestTypesCounter++;
          }
        });

        expect(requestTypesCounter).toBe(2);
        done();
      });

      gatewayClient
        .jsInit()
        .pipe(first())
        .subscribe(({ cachetoken, errorcode }) => {
          if (Number(errorcode) === 0) {
            gatewayClient.threedQuery({ ...requestObject, cachetoken } as any);
          }
        });
    });

    it('THREEDQUERY failed (bypass card)', done => {
      const testPayload = {
        requesttypedescriptions: ['THREEDQUERY'],
        threedbypasspaymenttypes: ['VISA']
      };
      const jwt = jwtgenerator({ ...jwtDefaultPayload, ...testPayload } as any, jwtSecretKey, jwtIss);

      testConfigProvider.setConfig({ datacenterurl, jwt });
      gatewayClient = Container.get(GatewayClient);

      gatewayClient
        .jsInit()
        .pipe(first())
        .subscribe(({ cachetoken, errorcode }) => {
          if (Number(errorcode) === 0) {
            gatewayClient.threedQuery({ ...requestObject, cachetoken } as any).subscribe({
              next: response => {
                expect(response.requesttypedescription).toBe('ERROR');
                expect(response.customeroutput).toBe('TRYAGAIN');
                expect(response.errorcode).toBe('22000');
                expect(response.errormessage).toBe('Bypass');
              },
              complete: done
            })
          }
        });
    });
  });
});
