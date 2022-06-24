import { SrcName } from '../SrcName';
import { environment } from '../../../../environments/environment';
import { EncryptionKeyProvider } from './EncryptionKeyProvider';
import { VISA_JWK } from './keys/visa';
import { IEncryptionKey } from './IEncryptionKey';
import DoneCallback = jest.DoneCallback;

describe('EncryptionKeyProvider', () => {
  let encryptionKeyProvider: EncryptionKeyProvider;

  beforeEach(() => {
    encryptionKeyProvider = new EncryptionKeyProvider();
  });

  describe.each([
    [
      SrcName.VISA, {
      kid: environment.CLICK_TO_PAY.VISA.ENCRYPTION_KID,
      jwk: VISA_JWK,
    } as IEncryptionKey,
    ],
  ])('getEncryptionKey()', (srcName: SrcName, encryptionKey: IEncryptionKey) => {
    it('returns encryption keys for supported SRC %s', (done: DoneCallback) => {
      encryptionKeyProvider.getEncryptionKey(srcName).subscribe(result => {
        expect(result).toEqual(encryptionKey);
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
