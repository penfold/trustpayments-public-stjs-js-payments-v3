import { SrcName } from '../SrcName';
import { EncryptionKeyProvider } from './EncryptionKeyProvider';
import DoneCallback = jest.DoneCallback;

describe('EncryptionKeyProvider', () => {
  let encryptionKeyProvider: EncryptionKeyProvider;

  beforeEach(() => {
    encryptionKeyProvider = new EncryptionKeyProvider();
  });

  describe('getEncryptionKey()', () => {
    it.each<SrcName | DoneCallback>([SrcName.VISA])('returns encryption keys for supported SRCs', (srcName: SrcName, done: DoneCallback) => {
      encryptionKeyProvider.getEncryptionKey(SrcName.VISA).subscribe(result => {
        expect(result).toEqual({
          kid: expect.anything(),
          pem: expect.anything(),
        })
        done();
      });
    });

    it('returns an error when SRC is not supported', done => {
      encryptionKeyProvider.getEncryptionKey('unknown' as SrcName).subscribe({
        error: error => {
          expect(error).toEqual(new Error('Cannot find encryption key for SRC: unknown'));
          done();
        },
      });
    });
  });
});
