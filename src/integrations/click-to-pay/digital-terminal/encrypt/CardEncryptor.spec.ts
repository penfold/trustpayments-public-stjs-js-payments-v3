import { switchMap } from 'rxjs';
import { SrcName } from '../SrcName';
import { ICardData } from '../interfaces/ICardData';
import { CardEncryptor } from './CardEncryptor';
import { EncryptionKeyProvider } from './EncryptionKeyProvider';

describe('CardEncryptor', () => {
  let cardEncryptor: CardEncryptor;
  let encryptionKeyProvider: EncryptionKeyProvider;

  beforeEach(() => {
    cardEncryptor = new CardEncryptor();
    encryptionKeyProvider = new EncryptionKeyProvider();
  });

  describe('encrypt()', () => {
    it('encrypts card data', done => {
      const cardData: ICardData = {
        primaryAccountNumber: '4111111111111111',
        panExpirationMonth: '01',
        panExpirationYear: '2023',
        cardSecurityCode: '123',
        cardholderFullName: 'John Doe',
      };

      encryptionKeyProvider.getEncryptionKey(SrcName.VISA).pipe(
        switchMap(key => cardEncryptor.encrypt(cardData, key)),
      ).subscribe(result => {
        expect(result).toEqual(expect.any(String));
        done();
      });
    });
  });
});
