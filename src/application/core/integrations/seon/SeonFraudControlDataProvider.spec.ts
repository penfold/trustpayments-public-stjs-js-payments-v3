import { instance, mock, spy, when, verify, anyFunction, anything, deepEqual } from 'ts-mockito';
import { SeonFraudControlDataProvider } from './SeonFraudControlDataProvider';
import { ISeon, ISeonConfig } from './ISeon';
import { DomMethods } from '../../shared/dom-methods/DomMethods';
import { environment } from '../../../../environments/environment';
import { Uuid } from '../../shared/uuid/Uuid';
import { forkJoin } from 'rxjs';
import { FrameIdentifier } from '../../../../shared/services/message-bus/FrameIdentifier';
import { BrowserDetector } from '../../../../shared/services/browser-detector/BrowserDetector';

type WindowType = Window & { seon: ISeon };

describe('SeonFraudControlDataProvider', () => {
  let seonMock: ISeon;
  let windowMock: WindowType;
  let frameIdentifierMock: FrameIdentifier;
  let browserDetectorMock: BrowserDetector;
  let seonFraudControlDataProvider: SeonFraudControlDataProvider;
  let domMethodsSpy: typeof DomMethods;

  beforeEach(() => {
    seonMock = mock<ISeon>();
    windowMock = mock<WindowType>();
    frameIdentifierMock = mock(FrameIdentifier);
    browserDetectorMock = mock(BrowserDetector);
    domMethodsSpy = spy(DomMethods);

    seonFraudControlDataProvider = new SeonFraudControlDataProvider(
      instance(windowMock),
      instance(frameIdentifierMock),
      instance(browserDetectorMock),
    );

    when(domMethodsSpy.insertScript(anything(), anything())).thenResolve();
    when(windowMock.seon).thenReturn(instance(seonMock));
    when(seonMock.config(anything())).thenCall((config: ISeonConfig) => {
      if (config.onSuccess) {
        config.onSuccess('success');
      }
    });
    when(frameIdentifierMock.isParentFrame()).thenReturn(false);
  });

  describe('init()', () => {
    it('inserts the SDK script into DOM', done => {
      seonFraudControlDataProvider.init().subscribe(() => {
        verify(domMethodsSpy.insertScript('head', deepEqual({ src: environment.SEON.LIBRARY_URL }))).once();
        done();
      });
    });

    it('configures Seon library', done => {
      const uuidSpy = spy(Uuid);
      const sessionId = '44eccb39-12ed-42f6-ab4c-151fe7e2ab32';

      when(uuidSpy.uuidv4()).thenReturn(sessionId);

      seonFraudControlDataProvider.init().subscribe(() => {
        verify(seonMock.config(deepEqual({
          host: 'cdn.seondf.com',
          session_id: sessionId,
          audio_fingerprint: true,
          canvas_fingerprint: true,
          webgl_fingerprint: anything(),
          onSuccess: anyFunction(),
          onError: anyFunction(),
        }))).once();
        done();
      });
    });

    it('returns stream error if Seon configuration fails', done => {
      when(seonMock.config(anything())).thenCall((config: ISeonConfig) => {
        if (config.onError) {
          config.onError('error');
        }
      });

      seonFraudControlDataProvider.init().subscribe({
        error: error => {
          expect(error).toEqual(new Error('error'));
          done();
        },
      });
    });

    it('inserts scripts and configures Seon only once when called multiple times', done => {
      forkJoin([
        seonFraudControlDataProvider.init(),
        seonFraudControlDataProvider.init(),
        seonFraudControlDataProvider.init(),
      ]).subscribe(() => {
        verify(domMethodsSpy.insertScript('head', anything())).once();
        verify(seonMock.config(anything())).once();
        done();
      });
    });
  });

  describe('getTransactionId()', () => {
    it('returns encoded payload from Seon library', done => {
      const payload = 'foobar';

      when(seonMock.getBase64Session(anything())).thenCall(callback => callback(payload));

      seonFraudControlDataProvider.getTransactionId().subscribe(result => {
        expect(result).toEqual(payload);
        done();
      });
    });

    it('returns null when getting payload from Seon library fails', done => {
      const consoleSpy = spy(console);

      when(consoleSpy.warn(anything())).thenReturn(undefined);
      when(seonMock.getBase64Session(anything())).thenCall(callback => callback(null));

      seonFraudControlDataProvider.getTransactionId().subscribe(result => {
        expect(result).toEqual(null);
        verify(consoleSpy.warn('Failed to retrieve session data.')).once();
        done();
      });
    });
  });
});
