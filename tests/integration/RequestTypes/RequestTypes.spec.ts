import { AuthRequest } from './AuthRequest';
import { Container } from 'typedi';
import { jwtgenerator } from '@securetrading/jwt-generator';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../../src/environments/environment';
import { ThreeDQueryRequest } from '../../../src/application/core/integrations/cardinal-commerce/ThreeDQueryRequest';
import { IConfig } from '../../../src/shared/model/config/IConfig';
import { GatewayClient } from '../../../src/application/core/services/GatewayClient';
import { ConfigProvider } from '../../../src/shared/services/config-provider/ConfigProvider';
import { TestConfigProvider } from '../../../src/testing/mocks/TestConfigProvider';
import { IThreeDInitResponse } from '../../../src/application/core/models/IThreeDInitResponse';
import { IThreeDQueryResponse } from '../../../src/application/core/models/IThreeDQueryResponse';
import { IStoreAccessor } from './IStoreAccessor';
import { SimpleStoreAccessor } from './SimpleStoreAccessor';

// give
describe('Testing app for different requestTypes', () => {
  const generatedJwt: string = jwtgenerator(
    {
      baseamount: '1000',
      accounttypedescription: 'ECOM',
      currencyiso3a: 'GBP',
      locale: 'en_GB',
      sitereference: 'test_james38641'
    },
    'ja<n}yP]3$1E$iUYtn_*i7))24I,=^',
    'am0310.autoapi'
  );

  const config: IConfig = {
    analytics: true,
    animatedCard: false,
    components: { defaultPaymentType: 'test', paymentTypes: ['test'], requestTypes: [], startOnLoad: true },
    datacenterurl: environment.GATEWAY_URL,
    jwt: generatedJwt,
    livestatus: 0,
    disableNotification: false,
    origin: 'https://someorigin.com',
    styles: {
      cardNumber: {
        'background-color-input': 'AliceBlue',
        'background-color-input-error': '#f8d7da',
        'color-input-error': '#721c24',
        'font-size-input': '12px',
        'line-height-input': '12px'
      },
      expirationDate: {
        'background-color-input': 'AliceBlue',
        'background-color-input-error': '#f8d7da',
        'color-input-error': '#721c24',
        'font-size-input': '12px',
        'line-height-input': '12px'
      },
      securityCode: {
        'background-color-input': 'AliceBlue',
        'background-color-input-error': '#f8d7da',
        'color-input-error': '#721c24',
        'font-size-input': '12px',
        'line-height-input': '12px'
      }
    },
    submitOnError: true,
    submitOnSuccess: true,
    buttonId: 'merchant-submit-button'
  };

  let gatewayClient: GatewayClient;
  let configProvider: TestConfigProvider;

  beforeEach(() => {
    Container.set({ id: IStoreAccessor, type: SimpleStoreAccessor });
    Container.set({ id: ConfigProvider, type: TestConfigProvider });
    gatewayClient = Container.get(GatewayClient);
    // @ts-ignore
    configProvider = Container.get(ConfigProvider) as TestConfigProvider;
    configProvider.setConfig(config);
  });

  // then
  it('should return AUTH request when its added in requestTypes property', done => {
    gatewayClient
      .jsInit()
      .pipe(
        switchMap((jsInitResponse: IThreeDInitResponse) => {
          return gatewayClient.threedQuery(
            new ThreeDQueryRequest(
              jsInitResponse.cachetoken,
              ['ACCOUNTCHECK', 'THREEDQUERY', 'AUTH'],
              {
                expirydate: '11/22',
                pan: '4111111111111111',
                securitycode: '111'
              },
              {}
            )
          );
        }),
        switchMap((threeDQueryResponse: IThreeDQueryResponse) => {
          console.error('THRE D QUERY: ', threeDQueryResponse);
          return gatewayClient.auth(
            new AuthRequest(
              ['ACCOUNTCHECK', 'AUTH'],
              {
                expirydate: '11/22',
                pan: '4111111111111111',
                securitycode: '111'
              },
              {},
              {}
            )
          );
        })
      )
      .subscribe((authResponse: any) => {
        console.error('AUTH RESPONSE: ', authResponse);
        done();
        expect(authResponse.requesttypedescription).toEqual('AUTH');
        return authResponse;
      });
  });
});
