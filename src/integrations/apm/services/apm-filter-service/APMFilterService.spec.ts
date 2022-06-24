import { anything, deepEqual, instance, mock, spy, verify, when } from 'ts-mockito';
import { ValidationError } from 'joi';
import { JwtDecoder } from '../../../../shared/services/jwt-decoder/JwtDecoder';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { IAPMItemConfig } from '../../models/IAPMItemConfig';
import { APMName } from '../../models/APMName';
import { IStJwtPayload } from '../../../../application/core/models/IStJwtPayload';
import { Debug } from '../../../../shared/Debug';
import { APMValidator } from '../apm-validator/APMValidator';
import { APMAvailabilityMap } from '../../models/APMAvailabilityMap';
import { APMCountryIso } from '../../models/APMCountryIso';
import { APMCurrencyIso } from '../../models/APMCurrencyIso';
import { SentryService } from '../../../../shared/services/sentry/SentryService';
import { MisconfigurationError } from '../../../../shared/services/sentry/errors/MisconfigurationError';
import { APMFilterService } from './APMFilterService';

describe('APMFilterService', () => {
  let jwtDecoderMock: JwtDecoder;
  let configProviderMock: ConfigProvider;
  let apmValidatorMock: APMValidator;
  let apmFilterService: APMFilterService;
  let debugSpy: typeof Debug;
  let consoleSpy: typeof window.console;
  let availabilityMapSpy: typeof APMAvailabilityMap;
  let sentryServiceMock: SentryService;

  beforeEach(() => {
    jwtDecoderMock = mock(JwtDecoder);
    configProviderMock = mock<ConfigProvider>();
    apmValidatorMock = mock(APMValidator);
    sentryServiceMock = mock(SentryService);
    apmFilterService = new APMFilterService(
      instance(jwtDecoderMock),
      instance(configProviderMock),
      instance(apmValidatorMock),
      instance(sentryServiceMock),
    );

    consoleSpy = spy(console);
    debugSpy = spy(Debug);
    availabilityMapSpy = spy(APMAvailabilityMap);

    when(debugSpy.warn(anything())).thenReturn(undefined);
    when(consoleSpy.warn(anything())).thenReturn(undefined);
    when(configProviderMock.getConfig()).thenReturn({ jwt: 'jwt' });
    when(apmValidatorMock.validateItemConfig(anything())).thenReturn(null);
    when(apmValidatorMock.validateJwt(anything(), anything())).thenReturn(null);
  });

  describe('filter()', () => {
    const item: IAPMItemConfig = {
      name: APMName.PAYU,
      minBaseAmount: 1000,
      maxBaseAmount: 2000,
    };
    const basePayload: IStJwtPayload = {
      currencyiso3a: 'PLN',
      billingcountryiso2a: 'PL',
    };
    const samplePayload: IStJwtPayload = {
      ...basePayload,
      baseamount: '1000',
    };
    const validationError = new ValidationError('not valid', null, null);

    beforeEach(() => {
      when(jwtDecoderMock.decode(anything())).thenReturn({ payload: samplePayload });
      when(availabilityMapSpy.has(anything())).thenReturn(true);
      when(availabilityMapSpy.get(anything())).thenReturn({
        countries: [APMCountryIso.PL],
        currencies: [APMCurrencyIso.PLN],
        payload: [],
      });
    });

    it('removes APMs that dont exist in APMAvailabilityMap', done => {
      const item1 = { ...item, name: APMName.ZIP };
      const item2 = { ...item, name: APMName.ALIPAY };
      const item3 = { ...item, name: APMName.EPS };

      when(availabilityMapSpy.has(APMName.ZIP)).thenReturn(true);
      when(availabilityMapSpy.has(APMName.ALIPAY)).thenReturn(false);
      when(availabilityMapSpy.has(APMName.EPS)).thenReturn(true);

      apmFilterService.filter([item1, item2, item3]).subscribe(result => {
        expect(result).toEqual([item1, item3]);
        verify(consoleSpy.warn('The following APMs have been hidden due to configuration incompatibility: ALIPAY')).once();
        done();
      });
    });

    it('removes items which dont pass config validation', done => {
      when(apmValidatorMock.validateItemConfig(item)).thenReturn(validationError);

      apmFilterService.filter([item]).subscribe(result => {
        expect(result).toEqual([]);
        verify(sentryServiceMock.sendCustomMessage(deepEqual(new MisconfigurationError('Misconfiguration: Configuration for PAYU APM is invalid: not valid')))).once();
        verify(debugSpy.warn('Configuration for PAYU APM is invalid: not valid')).once();
        done();
      });
    });

    it('removes items which dont pass jwt schema validation', done => {
      when(apmValidatorMock.validateJwt(item, samplePayload)).thenReturn(validationError);

      apmFilterService.filter([item]).subscribe(result => {
        expect(result).toEqual([]);
        verify(debugSpy.warn('JWT configuration for PAYU APM is invalid: not valid')).once();
        done();
      });
    });

    describe('countries and currencies', () => {
      it('doesnt remove items if billing country and currency matches the restrictions', done => {
        when(availabilityMapSpy.get(APMName.PAYU)).thenReturn({
          payload: [],
          countries: [APMCountryIso.PL],
          currencies: [APMCurrencyIso.PLN],
        });

        apmFilterService.filter([item]).subscribe(result => {
          expect(result).toEqual([item]);
          done();
        });
      });

      it('doesnt remove items if there are no country restrictions for them', done => {
        when(availabilityMapSpy.get(APMName.PAYU)).thenReturn({
          payload: [],
          countries: [],
          currencies: [APMCurrencyIso.PLN],
        });

        apmFilterService.filter([item]).subscribe(result => {
          expect(result).toEqual([item]);
          done();
        });
      });

      it('removes items if billing country doesnt match the restrictions', done => {
        when(availabilityMapSpy.get(APMName.PAYU)).thenReturn({
          payload: [],
          countries: [APMCountryIso.GB],
          currencies: [APMCurrencyIso.PLN],
        });

        apmFilterService.filter([item]).subscribe(result => {
          expect(result).toEqual([]);
          verify(debugSpy.warn('Billing country PL is not available for PAYU.')).once();
          done();
        });
      });

      it('doesnt remove items if there are no currency restrictions for them', done => {
        when(availabilityMapSpy.get(APMName.PAYU)).thenReturn({
          payload: [],
          countries: [APMCountryIso.PL],
          currencies: [],
        });

        apmFilterService.filter([item]).subscribe(result => {
          expect(result).toEqual([item]);
          done();
        });
      });

      it('removes items if payment currency doesnt match the restrictions', done => {
        when(availabilityMapSpy.get(APMName.PAYU)).thenReturn({
          payload: [],
          countries: [APMCountryIso.PL],
          currencies: [APMCurrencyIso.GBP],
        });

        apmFilterService.filter([item]).subscribe(result => {
          expect(result).toEqual([]);
          verify(debugSpy.warn('Billing currency PLN is not available for PAYU.')).once();
          done();
        });
      });
    });

    describe('min and max amount', () => {
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
  });
});
