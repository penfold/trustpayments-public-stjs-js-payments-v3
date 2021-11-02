import { Cybertonica } from './Cybertonica';
import { DomMethods } from '../../shared/dom-methods/DomMethods';
import { instance, mock, spy, when, anything, verify, deepEqual } from 'ts-mockito';
import { IAFCybertonica } from './IAFCybertonica';
import { environment } from '../../../../environments/environment';
import { firstValueFrom, forkJoin, NEVER, switchMap } from 'rxjs';

type WindowType = Window & { AFCYBERTONICA: IAFCybertonica };

describe('Cybertonica', () => {
  const TID = '343d7850-5cfc-4f5a-b8d0-c06e6af3d556';

  let cybertonica: Cybertonica;
  let windowMock: WindowType;
  let cybertonicaMock: IAFCybertonica;
  let domMethodsSpy: typeof DomMethods;

  beforeEach(() => {
    domMethodsSpy = spy(DomMethods);
    windowMock = mock<WindowType>();
    cybertonicaMock = mock<IAFCybertonica>();
    cybertonica = new Cybertonica(instance(windowMock));

    when(windowMock.AFCYBERTONICA).thenReturn(instance(cybertonicaMock));
    when(domMethodsSpy.insertScript(anything(), anything())).thenResolve(null);
    when(cybertonicaMock.init(anything(), anything(), anything())).thenReturn(TID);
  });

  describe('init()', () => {
    it('inserts Cybertonica script into DOM', done => {
      cybertonica.init('apiKey').subscribe(() => {
        verify(domMethodsSpy.insertScript('head', deepEqual({ src: environment.CYBERTONICA.CYBERTONICA_LIVE_URL }))).once();
        done();
      });
    });

    it('initializes Cybertonica library', done => {
      cybertonica.init('apiKey').subscribe(() => {
        verify(cybertonicaMock.init('apiKey', undefined, 'https://cyber.securetrading.net')).once();
        done();
      });
    });

    it('doesnt initialize Cybertonica if apiUserName is empty', done => {
      forkJoin([
        cybertonica.init(null),
        cybertonica.init(undefined),
        cybertonica.init(''),
      ]).subscribe(() => {
        verify(cybertonicaMock.init(anything(), anything(), anything())).never();
        verify(domMethodsSpy.insertScript(anything(), anything())).never();
        done();
      });
    });

    it('inserts scripts and configures Cybertonica only once when called multiple times', done => {
      forkJoin([
        cybertonica.init('apiKey'),
        cybertonica.init('apiKey'),
        cybertonica.init('apiKey'),
      ]).subscribe(() => {
        verify(cybertonicaMock.init(anything(), anything(), anything())).once();
        verify(domMethodsSpy.insertScript(anything(), anything())).once();
        done();
      });
    });
  });

  describe('getTransactionId()', () => {
    it('returns fraud control transaction id', done => {
      cybertonica.init('apiKey').pipe(
        switchMap(() => cybertonica.getTransactionId()),
      ).subscribe(tid => {
        expect(tid).toEqual(TID);
        done();
      });
    });

    it('returns null if cybertonica initialization fails', done => {
      when(cybertonicaMock.init(anything(), anything(), anything())).thenThrow(new Error('failed'));

      cybertonica.init('apiKey').pipe(
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

      cybertonica.init('apiKey').pipe(
        switchMap(() => cybertonica.getTransactionId()),
      ).subscribe(tid => {
        expect(tid).toBeNull();
        done();
      });
    });
  });
});