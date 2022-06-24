import { JWK } from 'jose';

export interface IEncryptionKey {
  kid: string;
  jwk: JWK;
}
