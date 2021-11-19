import { firstValueFrom, forkJoin, NEVER, of, switchMap } from 'rxjs';
import { instance, mock, spy, when, anything, verify, deepEqual } from 'ts-mockito';
import { environment } from '../../../../environments/environment';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { DomMethods } from '../../shared/dom-methods/DomMethods';
import { IAFCybertonica } from './IAFCybertonica';
import { Cybertonica } from './Cybertonica';

type WindowType = Window & { AFCYBERTONICA: IAFCybertonica };

describe('Cybertonica', () => {
  const TID = '343d7850-5cfc-4f5a-b8d0-c06e6af3d556';

  let cybertonica: Cybertonica;
  let windowMock: WindowType;
  let configProviderMock: ConfigProvider;
  let cybertonicaMock: IAFCybertonica;
  let domMethodsSpy: typeof DomMethods;

  beforeEach(() => {
    domMethodsSpy = spy(DomMethods);
    windowMock = mock<WindowType>();
    cybertonicaMock = mock<IAFCybertonica>();
    configProviderMock = mock<ConfigProvider>();
    cybertonica = new Cybertonica(
      instance(windowMock),
      instance(configProviderMock),
    );

    when(windowMock.AFCYBERTONICA).thenReturn(instance(cybertonicaMock));
    when(domMethodsSpy.insertScript(anything(), anything())).thenResolve(null);
    when(cybertonicaMock.init(anything(), anything(), anything())).thenReturn(TID);
    when(configProviderMock.getConfig$()).thenReturn(of({
      cybertonicaApiKey: 'apiKey',
    }));
  });

  describe('init()', () => {
    it('inserts Cybertonica script into DOM', done => {
      cybertonica.init().subscribe(() => {
        verify(domMethodsSpy.insertScript('head', deepEqual({ src: environment.CYBERTONICA.CYBERTONICA_LIVE_URL }))).once();
        done();
      });
    });

    it('initializes Cybertonica library', done => {
      cybertonica.init().subscribe(() => {
        verify(cybertonicaMock.init('apiKey', undefined, 'https://cyber.securetrading.net')).once();
        done();
      });
    });

    it('inserts scripts and configures Cybertonica only once when called multiple times', done => {
      forkJoin([
        cybertonica.init(),
        cybertonica.init(),
        cybertonica.init(),
      ]).subscribe(() => {
        verify(cybertonicaMock.init(anything(), anything(), anything())).once();
        verify(domMethodsSpy.insertScript(anything(), anything())).once();
        done();
      });
    });
  });

  describe('getTransactionId()', () => {
    it('returns fraud control transaction id', done => {
      cybertonica.init().pipe(
        switchMap(() => cybertonica.getTransactionId()),
      ).subscribe(tid => {
        expect(tid).toEqual(TID);
        done();
      });
    });

    it('returns null if cybertonica initialization fails', done => {
      when(cybertonicaMock.init(anything(), anything(), anything())).thenThrow(new Error('failed'));

      cybertonica.init().pipe(
        switchMap(() => cybertonica.getTransactionId()),
      ).subscribe(tid => {
        expect(tid).toBeNull();
        done();
      });
    });

    it('returns null if getting TID takes longer then timeout value', done => {
      // @ts-ignore to speed up test
      when(spy(Cybertonica).TID_TIMEOUT).thenReturn(100);
      when(domMethodsSpy.insertScript(anything(), anything())).thenReturn(firstValueFrom(NEVER));

      cybertonica.init().pipe(
        switchMap(() => cybertonica.getTransactionId()),
      ).subscribe(tid => {
        expect(tid).toBeNull();
        done();
      });
    });
  });
});
