import { mock, instance, when, verify, anything } from 'ts-mockito';
import { ContainerInstance } from 'typedi';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { FraudControlServiceSelector } from './FraudControlServiceSelector';
import { SeonFraudControlDataProvider } from '../../integrations/seon/SeonFraudControlDataProvider';
import { of, forkJoin } from 'rxjs';

describe('FraudControlServiceSelector', () => {
  let containerMock: ContainerInstance;
  let configProviderMock: ConfigProvider;
  let fraudControlServiceSelector: FraudControlServiceSelector;
  let seonFraudControlDataProviderMock: SeonFraudControlDataProvider;
  let seonFraudControlDataProvider: SeonFraudControlDataProvider;

  beforeEach(() => {
    containerMock = mock(ContainerInstance);
    configProviderMock = mock<ConfigProvider>();
    seonFraudControlDataProviderMock = mock(SeonFraudControlDataProvider);
    seonFraudControlDataProvider = instance(seonFraudControlDataProviderMock);
    fraudControlServiceSelector = new FraudControlServiceSelector(
      instance(containerMock),
      instance(configProviderMock),
    );

    when(containerMock.get(SeonFraudControlDataProvider)).thenReturn(seonFraudControlDataProvider);
    when(seonFraudControlDataProviderMock.init()).thenReturn(of(undefined));
  });

  describe('getFraudControlDataProvider()', () => {
    it('initializes and returns Seon data provider', done => {
      fraudControlServiceSelector.getFraudControlDataProvider().subscribe(result => {
        expect(result).toBe(seonFraudControlDataProvider);
        verify(seonFraudControlDataProviderMock.init()).once();
        done();
      });
    });

    it('only initializes Seon service once when called multiple times', done => {
      forkJoin([
        fraudControlServiceSelector.getFraudControlDataProvider(),
        fraudControlServiceSelector.getFraudControlDataProvider(),
        fraudControlServiceSelector.getFraudControlDataProvider(),
      ]).subscribe(result => {
        verify(seonFraudControlDataProviderMock.init()).once();
        done();
      });
    });
  });
});