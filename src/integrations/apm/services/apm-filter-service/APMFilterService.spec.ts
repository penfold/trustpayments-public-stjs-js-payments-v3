import { JwtDecoder } from '../../../../shared/services/jwt-decoder/JwtDecoder';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { APMFilterService } from './APMFilterService';
import { anything, instance, mock, spy, verify, when } from 'ts-mockito';
import { IAPMItemConfig } from '../../models/IAPMItemConfig';
import { APMName } from '../../models/APMName';
import { IStJwtPayload } from '../../../../application/core/models/IStJwtPayload';
import { Debug } from '../../../../shared/Debug';
import { configFactory, fullAPMList, payloadFactory } from './APMFilterServiceTestConfigurations';
import { APMCurrencyIso } from '../../models/APMCurrencyIso';
import { APMCountryIso } from '../../models/APMCountryIso';

describe('APMFilterService', () => {
  let jwtDecoderMock: JwtDecoder;
  let configProviderMock: ConfigProvider;
  let apmFilterService: APMFilterService;
  let debugSpy: typeof Debug;

  beforeEach(() => {
    jwtDecoderMock = mock(JwtDecoder);
    configProviderMock = mock<ConfigProvider>();
    apmFilterService = new APMFilterService(
      instance(jwtDecoderMock),
      instance(configProviderMock),
    );

    debugSpy = spy(Debug);

    when(debugSpy.warn(anything())).thenReturn(undefined);
  });

  describe('filter()', () => {

    describe('min and max amount', () => {
      const item: IAPMItemConfig = {
        name: APMName.PAYU,
        minBaseAmount: 1000,
        maxBaseAmount: 2000,
      };
      const basePayload: IStJwtPayload = {
        currencyiso3a: 'PLN',
        billingcountryiso2a: 'PL',
      };

      it('doesnt remove item when baseamount is between min and max amount', done => {
        when(jwtDecoderMock.decode(anything())).thenReturn({ payload: { ...basePayload, baseamount: '1500' } });

        apmFilterService.filter([item], 'jwt').subscribe(result => {
          expect(result).toEqual([item]);
          done();
        });
      });

      it('removes item when baseamount < min amount', done => {
        when(jwtDecoderMock.decode(anything())).thenReturn({ payload: { ...basePayload, baseamount: '999' } });

        apmFilterService.filter([item], 'jwt').subscribe(result => {
          expect(result).toEqual([]);
          verify(debugSpy.warn('Payment amount (999) is lower than minimal value (1000) for PAYU.')).once();
          done();
        });
      });

      it('removes item when baseamount > max amount', done => {
        when(jwtDecoderMock.decode(anything())).thenReturn({ payload: { ...basePayload, baseamount: '2001' } });

        apmFilterService.filter([item], 'jwt').subscribe(result => {
          expect(result).toEqual([]);
          verify(debugSpy.warn('Payment amount (2001) is greater than maximal value (2000) for PAYU.')).once();
          done();
        });
      });

      it('doesnt remove item when calculated mainamount is between min and max amount', done => {
        when(jwtDecoderMock.decode(anything())).thenReturn({ payload: { ...basePayload, mainamount: '15.00' } });

        apmFilterService.filter([item], 'jwt').subscribe(result => {
          expect(result).toEqual([item]);
          done();
        });
      });

      it('removes item when calculated mainamount < min amount', done => {
        when(jwtDecoderMock.decode(anything())).thenReturn({ payload: { ...basePayload, mainamount: '9.99' } });

        apmFilterService.filter([item], 'jwt').subscribe(result => {
          expect(result).toEqual([]);
          verify(debugSpy.warn('Payment amount (999) is lower than minimal value (1000) for PAYU.')).once();
          done();
        });
      });

      it('removes item when calculated mainamount > max amount', done => {
        when(jwtDecoderMock.decode(anything())).thenReturn({ payload: { ...basePayload, mainamount: '20.01' } });

        apmFilterService.filter([item], 'jwt').subscribe(result => {
          expect(result).toEqual([]);
          verify(debugSpy.warn('Payment amount (2001) is greater than maximal value (2000) for PAYU.')).once();
          done();
        });
      });
    });

    describe('Undefined fields in JWT', () => {


      it(`should return only ${APMName.BITPAY} and ${APMName.UNIONPAY} pay for full APM list, ${APMCurrencyIso.GBP} and ${APMCountryIso.GB} and minimal payload`, done => {
        when(jwtDecoderMock.decode(anything())).thenReturn({ payload: payloadFactory(APMCurrencyIso.GBP, APMCountryIso.GB) });

        apmFilterService.filter(fullAPMList, 'jwt').subscribe(result => {
          expect(result).toEqual([configFactory(APMName.BITPAY), configFactory(APMName.UNIONPAY)]);
          verify(debugSpy.warn(anything())).times(4);
          done();
        });
      });

      it(`should return ZIP when`)
    });

    describe.skip('Unavailable APM', () => {

    });

    describe.skip('Countries supported by APM', () => {

    });

    describe.skip('Currencies supported by APM', () => {

    });

  });
});
