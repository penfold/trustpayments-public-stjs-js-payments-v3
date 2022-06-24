import faker from '@faker-js/faker';
import { importJWK, JWK } from 'jose';
import { ICardData } from '../interfaces/ICardData';
import { CardEncryptor } from './CardEncryptor';

// jose library classes are not injected, hence module mock
jest.mock('jose', () => ({
  CompactEncrypt: function() {
    this.encrypt = jest.fn().mockResolvedValue('encrypted-data');
    this.setContentEncryptionKey = jest.fn().mockReturnThis();
    this.setInitializationVector = jest.fn().mockReturnThis();
    this.setKeyManagementParameters = jest.fn().mockReturnThis();
    this.setProtectedHeader = jest.fn().mockReturnThis();
  },
  importJWK: jest.fn(),
}));

describe('CardEncryptor', () => {
  let cardEncryptor: CardEncryptor;
  const testCardData: ICardData = {
    primaryAccountNumber: faker.finance.creditCardNumber(),
    cardholderFullName: faker.name.firstName() + faker.name.lastName(),
    billingAddress: null,
    panExpirationYear: faker.date.past().getFullYear().toString(),
    panExpirationMonth: faker.date.month(),
    cardholderLastName: faker.name.lastName(),
    cardSecurityCode: faker.finance.creditCardCVV(),
    cardholderFirstName: faker.name.firstName(),
  };

  const testSrcKid = faker.datatype.uuid();
  const testSrcJWK: JWK = {
    n: faker.datatype.uuid(),
    e: faker.datatype.uuid(),
    d: faker.datatype.uuid(),
  };

  beforeEach(() => {
    cardEncryptor = new CardEncryptor();
  });

  describe('encrypt()', () => {
    it('import provided SRC JWK and make sure that it contains SRC KID', done => {
      cardEncryptor.encrypt(testCardData, {
          kid: testSrcKid,
          jwk: testSrcJWK,
        }
      ).subscribe((encryptedCard) => {
        expect(importJWK).toHaveBeenCalledWith({
          kid: testSrcKid,
          kty: 'RSA',
          e: testSrcJWK.e,
          n: testSrcJWK.n,
        } as JWK, 'RSA-OAEP-256');

        done();
      });
    });
    it('encrypts card data with imported key using compact JWE encryption and returns Promise with string', done => {
      cardEncryptor.encrypt(testCardData, {
          kid: testSrcKid,
          jwk: testSrcJWK,
        }
      ).subscribe((encryptedCard) => {
        expect(encryptedCard).toEqual('encrypted-data');
        done();
      });
    });
  });
});
