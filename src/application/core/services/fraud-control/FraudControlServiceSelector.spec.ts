import { mock, instance, when, verify } from 'ts-mockito';
import { of, forkJoin } from 'rxjs';
import { ContainerInstance } from 'typedi';
import { JwtProvider } from '../../../../shared/services/jwt-provider/JwtProvider';
import { SeonFraudControlDataProvider } from '../../integrations/seon/SeonFraudControlDataProvider';
import { FraudControlServiceSelector } from './FraudControlServiceSelector';
import { DisabledFraudControlDataProvider } from './DisabledFraudControlDataProvider';

describe('FraudControlServiceSelector', () => {
  let containerMock: ContainerInstance;
  let jwtProviderMock: JwtProvider;
  let fraudControlServiceSelector: FraudControlServiceSelector;
  let seonFraudControlDataProviderMock: SeonFraudControlDataProvider;
  let seonFraudControlDataProvider: SeonFraudControlDataProvider;
  let disabledFraudControlDataProviderMock: DisabledFraudControlDataProvider;
  let disabledFaudControlDataProvider: DisabledFraudControlDataProvider;

  beforeEach(() => {
    containerMock = mock(ContainerInstance);
    jwtProviderMock = mock(JwtProvider);
    seonFraudControlDataProviderMock = mock(SeonFraudControlDataProvider);
    seonFraudControlDataProvider = instance(seonFraudControlDataProviderMock);
    disabledFraudControlDataProviderMock = mock(DisabledFraudControlDataProvider);
    disabledFaudControlDataProvider = instance(disabledFraudControlDataProviderMock);
    fraudControlServiceSelector = new FraudControlServiceSelector(
      instance(containerMock),
      instance(jwtProviderMock),
    );

    when(jwtProviderMock.getJwtPayload()).thenReturn(of({}));
    when(containerMock.get(SeonFraudControlDataProvider)).thenReturn(seonFraudControlDataProvider);
    when(containerMock.get(DisabledFraudControlDataProvider)).thenReturn(disabledFaudControlDataProvider);
    when(seonFraudControlDataProviderMock.init()).thenReturn(of(undefined));
    when(disabledFraudControlDataProviderMock.init()).thenReturn(of(undefined));
  });

  describe('getFraudControlDataProvider()', () => {
    it('initializes and returns Seon data provider by default', done => {
      fraudControlServiceSelector.getFraudControlDataProvider().subscribe(result => {
        expect(result).toBe(seonFraudControlDataProvider);
        verify(seonFraudControlDataProviderMock.init()).once();
        done();
      });
    });

    it('only initializes fraud control service once when called multiple times', done => {
      forkJoin([
        fraudControlServiceSelector.getFraudControlDataProvider(),
        fraudControlServiceSelector.getFraudControlDataProvider(),
        fraudControlServiceSelector.getFraudControlDataProvider(),
      ]).subscribe(result => {
        verify(seonFraudControlDataProviderMock.init()).once();
        done();
      });
    });

    it('initializes and return DisabledFraudControlDataProvider if fraudcontroltransactionid exists in jwt payload', done => {
      when(jwtProviderMock.getJwtPayload()).thenReturn(of({ fraudcontroltransactionid: 'sometid' }));

      fraudControlServiceSelector.getFraudControlDataProvider().subscribe(result => {
        expect(result).toBe(disabledFaudControlDataProvider);
        verify(disabledFraudControlDataProviderMock.init()).once();
        done();
      });
    });
  });
});
