import { instance, mock, when } from 'ts-mockito';
import { of } from 'rxjs';
import { ConfigProvider } from '../../../../../shared/services/config-provider/ConfigProvider';
import { DomMethods } from '../../../../../application/core/shared/dom-methods/DomMethods';
import { environment } from '../../../../../environments/environment';
import { SrcName } from '../../SrcName';
import { MastercardSrcProvider } from './MastercardSrcProvider';
import { MastercardSrcWrapper } from './MastercardSrcWrapper';
jest.mock('./MastercardSrcWrapper');
import spyOn = jest.spyOn;

describe('VisaSrcProvider', () => {
  let configProviderMock: ConfigProvider;
  let mastercardSrcProvider: MastercardSrcProvider;

  beforeEach(() => {
    configProviderMock = mock<ConfigProvider>();

    when(configProviderMock.getConfig$()).thenReturn(of({ livestatus: 0 }));

    mastercardSrcProvider = new MastercardSrcProvider(instance(configProviderMock));
  });

  describe('getSrcName()', () => {
    it('returns src name of the provider', () => {
      expect(mastercardSrcProvider.getSrcName()).toBe(SrcName.MASTERCARD);
    });
  });

  describe('getSrc()', () => {
    beforeEach(() => {
      spyOn(DomMethods, 'insertScript').mockImplementation(() => of(null));
    });

    it('injects sandbox SRC SDK when livestatus = 0', done => {
      mastercardSrcProvider.getSrc().subscribe(() => {
        expect(DomMethods.insertScript).toHaveBeenCalledWith('head', { src: environment.CLICK_TO_PAY.MASTERCARD.SRC_SDK_URL.SANDBOX });
        done();
      });
    });

    describe('livestatus = 1', () => {
      beforeEach(() => {
        when(configProviderMock.getConfig$()).thenReturn(of({ livestatus: 1 }));
        mastercardSrcProvider = new MastercardSrcProvider(instance(configProviderMock));
      });

      it('injects prod SRC SDK when livestatus = 1', done => {
        mastercardSrcProvider.getSrc().subscribe(() => {
          expect(DomMethods.insertScript).toHaveBeenCalledWith('head', { src: environment.CLICK_TO_PAY.MASTERCARD.SRC_SDK_URL.PROD });
          done();
        });
      });
    });

    it('returns a new instance of SRC wrapper', done => {
      mastercardSrcProvider.getSrc().subscribe(src => {
        expect(src).toBeInstanceOf(MastercardSrcWrapper);
        done();
      });
    });

    it('only inserts script into DOM once when called multiple times', () => {
      mastercardSrcProvider.getSrc().subscribe();
      mastercardSrcProvider.getSrc().subscribe();
      mastercardSrcProvider.getSrc().subscribe();
      expect(DomMethods.insertScript).toHaveBeenCalledTimes(1);
    });
  });
});
