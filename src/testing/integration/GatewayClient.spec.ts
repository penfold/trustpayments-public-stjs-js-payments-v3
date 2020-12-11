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
          console.log(response);
          const { customeroutput, errordata, errorcode } = response.data;
          expect(customeroutput).toBe('TRYAGAIN');
          expect(errordata).toContain('subscriptionnumber');
          expect(errorcode).toBe('30000');
          console.log('koniec');
        });

      gatewayClient
        .jsInit()
        .pipe(first(), tap(console.log))
        .subscribe(({ cachetoken, errorcode }) => {
          if (Number(errorcode) === 0) {
            gatewayClient.threedQuery({ ...requestObject, cachetoken } as any);
          }
        });

      setTimeout(done, 5000);
    });

    it('AUTH passed, ACCOUNTCHECK failed', done => {
      console.log('DRUGI TEST');
      done();
      // console.log(Container.get(WINDOW));
      //
      // const testPayload = {
      //   requesttypedescriptions: ['AUTH', 'ACCOUNTCHECK']
      // };
      // const jwt = jwtgenerator({ ...jwtDefaultPayload, ...testPayload } as any, jwtSecretKey, jwtIss);
      //
      // testConfigProvider.setConfig({ datacenterurl, jwt });
      // gatewayClient = Container.get(GatewayClient);

      // messageBus.subscribe((response: { type: string; data: IResponseData }) => {
      //   if (response.type === 'TRANSACTION_COMPLETE') {
      //     const { customeroutput, errordata, errorcode } = response.data;
      //     expect(customeroutput).toBeUndefined();
      //     expect(errordata).toContain('requesttypedescriptions');
      //     expect(errorcode).toBe('30000');
      //     done();
      //   }
      // });

      // gatewayClient.jsInit().subscribe(({ cachetoken, errorcode }) => {
      //   if (Number(errorcode) === 0) {
      //     gatewayClient.threedQuery({ ...requestObject, cachetoken } as any);
      //   }
      // });
    });

    //   it('RISKDEC / ACCOUNTCHECK / THREEDQUERY / AUTH passed', done => {
    //     const testPayload = {
    //       requesttypedescriptions: ['RISKDEC', 'ACCOUNTCHECK', 'THREEDQUERY', 'AUTH']
    //     };
    //     const jwt = jwtgenerator({ ...jwtDefaultPayload, ...testPayload } as any, jwtSecretKey, jwtIss);

    //     testConfigProvider.setConfig({ datacenterurl, jwt });
    //     Container.set(ConfigProvider, testConfigProvider);

    //     gatewayClient.jsInit().subscribe(({ cachetoken, errorcode }) => {
    //       if (Number(errorcode) === 0) {
    //         gatewayClient.threedQuery({ ...requestObject, cachetoken }).subscribe({
    //           next: response => {
    //             expect(response.requesttypedescription).toBe('THREEDQUERY');
    //             expect(response.paymenttypedescription).toBe('VISA');
    //             expect(response.customeroutput).toBe('THREEDREDIRECT');
    //             expect(response.errormessage).toBe('Payment has been successfully processed');
    //           },
    //           complete: () => done()
    //         });
    //       }
    //     });
    //   });

    //   it('RISKDEC / ACCOUNTCHECK / AUTH passed, THREEDQUERY bypassed, SUBSCRIPTION failed', done => {
    //     const testPayload = {
    //       requesttypedescriptions: ['RISKDEC', 'ACCOUNTCHECK', 'THREEDQUERY', 'AUTH', 'SUBSCRIPTION'],
    //       threedbypasspaymenttypes: ['VISA']
    //     };
    //     const jwt = jwtgenerator({ ...jwtDefaultPayload, ...testPayload } as any, jwtSecretKey, jwtIss);

    //     testConfigProvider.setConfig({ datacenterurl, jwt });
    //     Container.set(ConfigProvider, testConfigProvider);

    //     gatewayClient.jsInit().subscribe(({ cachetoken, errorcode }) => {
    //       if (Number(errorcode) === 0) {
    //         gatewayClient.threedQuery({ ...requestObject, cachetoken }).subscribe({
    //           next: response => {
    //             expect(response.requesttypedescription).toBe('ACCOUNTCHECK');
    //             expect(response.paymenttypedescription).toBe('VISA');
    //             expect(response.customeroutput).toBe('RESULT');
    //             expect(response.errormessage).toBe('Payment has been successfully processed');
    //           },
    //           complete: () => done()
    //         });
    //       }
    //     });
    //   });

    //   it('THREEDQUERY failed (bypass card)', done => {
    //     const testPayload = {
    //       requesttypedescriptions: ['THREEDQUERY'],
    //       threedbypasspaymenttypes: ['VISA']
    //     };
    //     const jwt = jwtgenerator({ ...jwtDefaultPayload, ...testPayload } as any, jwtSecretKey, jwtIss);

    //     testConfigProvider.setConfig({ datacenterurl, jwt });
    //     Container.set(ConfigProvider, testConfigProvider);

    //     gatewayClient.jsInit().subscribe(({ cachetoken, errorcode }) => {
    //       if (Number(errorcode) === 0) {
    //         gatewayClient.threedQuery({ ...requestObject, cachetoken }).subscribe({
    //           next: response => {
    //             expect(response.requesttypedescription).toBe('ERROR');
    //             expect(response.customeroutput).toBe('TRYAGAIN');
    //             expect(response.errorcode).toBe('22000');
    //             expect(response.errormessage).toBe('Bypass');
    //           },
    //           complete: () => done()
    //         });
    //       }
    //     });
    //   });
  });
});
