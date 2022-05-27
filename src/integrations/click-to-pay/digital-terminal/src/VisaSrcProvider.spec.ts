import { instance, mock, when } from 'ts-mockito';
import { of } from 'rxjs';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { DomMethods } from '../../../../application/core/shared/dom-methods/DomMethods';
import { environment } from '../../../../environments/environment';
import { SrcName } from '../SrcName';
import { VisaSrcProvider } from './VisaSrcProvider';
import spyOn = jest.spyOn;

class VisaSrciAdapterMock {

}

describe('VisaSrcProvider', () => {
  let configProviderMock: ConfigProvider;
  let visaSrcProvider: VisaSrcProvider;

  beforeAll(() => {
    // @ts-ignore
    window.vAdapters = { VisaSRCI: VisaSrciAdapterMock };
  });

  beforeEach(() => {
    configProviderMock = mock<ConfigProvider>();

    when(configProviderMock.getConfig$()).thenReturn(of({ livestatus: 0 }));

    visaSrcProvider = new VisaSrcProvider(instance(configProviderMock));
  });

  describe('getSrcName()', () => {
    it('returns src name of the provider', () => {
      expect(visaSrcProvider.getSrcName()).toBe(SrcName.VISA);
    });
  });

  describe('getSrc()', () => {
    beforeEach(() => {
      spyOn(DomMethods, 'insertScript').mockImplementation(() => of(null));
    });

    it('injects sandbox SRC SDK when livestatus = 0', done => {
      visaSrcProvider.getSrc().subscribe(() => {
        expect(DomMethods.insertScript).toHaveBeenCalledWith('head', { src: environment.CLICK_TO_PAY.VISA.SRC_SDK_URL.SANDBOX });
        done();
      });
    });

    describe('livestatus = 1', () => {
      beforeEach(() => {
        when(configProviderMock.getConfig$()).thenReturn(of({ livestatus: 1 }));
        visaSrcProvider = new VisaSrcProvider(instance(configProviderMock));
      });

      it('injects prod SRC SDK when livestatus = 1', done => {
        visaSrcProvider.getSrc().subscribe(() => {
          expect(DomMethods.insertScript).toHaveBeenCalledWith('head', { src: environment.CLICK_TO_PAY.VISA.SRC_SDK_URL.PROD });
          done();
        });
      });
    });

    it('returns a new instance of SRC', done => {
      visaSrcProvider.getSrc().subscribe(src => {
        expect(src).toBeInstanceOf(VisaSrciAdapterMock);
        done();
      });
    });

    it('only inserts script into DOM once when called multiple times', () => {
      visaSrcProvider.getSrc().subscribe();
      visaSrcProvider.getSrc().subscribe();
      visaSrcProvider.getSrc().subscribe();
      expect(DomMethods.insertScript).toHaveBeenCalledTimes(1);
    });
  });
});
