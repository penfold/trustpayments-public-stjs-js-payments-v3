import * as jose from 'node-jose';
import { Service } from 'typedi';
import { from, Observable } from 'rxjs';
import { IEncryptionKey } from './IEncryptionKey';
import EncryptOptions = jose.JWE.EncryptOptions;

@Service()
export class CardEncryptor {
  encrypt(payload: unknown, encryptionKey: IEncryptionKey): Observable<string> {
    return from(this.doEncrypt(payload, encryptionKey));
  }

  private async doEncrypt(payload: unknown, encryptionKey: IEncryptionKey): Promise<string> {
    const pem = typeof encryptionKey.pem === 'string' ? await this.readKey(encryptionKey.pem) : encryptionKey.pem;
    const keyInput = {
      kty: 'RSA',
      e: pem.e, // Public key exponent
      n: pem.n, // Public key modulus
      kid: encryptionKey.kid,
      use: 'enc',
      alg: 'RSA-OAEP-256',
      ext_content: 'payload',
    };
    const key = await jose.JWK.asKey(keyInput);
    const contentAlg = 'A256GCM';
    const options: EncryptOptions = {
      format: 'compact',
      contentAlg,
      fields: {
        kid: key.kid,
        typ: 'JOSE',
        iat: Date.now(),
        alg: key.alg,
        enc: contentAlg,
      },
    };

    return jose.JWE.createEncrypt(options, key)
      .update(JSON.stringify(payload))
      .final();
  }

  private async readKey(pem: string): Promise<{ n: string, e: string }> {
    const key = await jose.JWK.asKey(pem, 'pem');

    return key.toJSON() as { n: string, e: string };
  }
}
