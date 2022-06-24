import { Service } from 'typedi';
import { from, Observable } from 'rxjs';
import { CompactEncrypt, importJWK } from 'jose';
import { IEncryptionKey } from './IEncryptionKey';

@Service()
export class CardEncryptor {
  encrypt(payload: unknown, encryptionKey: IEncryptionKey): Observable<string> {
    return from(this.doEncrypt(payload, encryptionKey));
  }

  private async doEncrypt(payload: unknown, encryptionKey: IEncryptionKey): Promise<string> {
    const jwk = {
      e: encryptionKey.jwk.e,
      n: encryptionKey.jwk.n,
      kty: 'RSA',
      kid: encryptionKey.kid,
    };

    const importedJWK = await importJWK(jwk, 'RSA-OAEP-256');

    return new CompactEncrypt(
      new TextEncoder().encode(JSON.stringify(payload))
    )
      .setProtectedHeader({
        alg: 'RSA-OAEP-256',
        enc: 'A256GCM',
        kid: encryptionKey.kid,
        typ: 'JOSE',
      })
      .encrypt(importedJWK);
  }
}
