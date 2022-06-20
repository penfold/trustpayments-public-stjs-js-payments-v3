import { Service } from 'typedi';
import { from, Observable } from 'rxjs';
import { CompactEncrypt, importJWK, JWK } from 'jose';
import { IEncryptionKey } from './IEncryptionKey';

@Service()
export class CardEncryptor {
  encrypt(payload: unknown, encryptionKey: IEncryptionKey): Observable<string> {
    return from(this.doEncrypt(payload, encryptionKey));
  }

  private async doEncrypt(payload: unknown, encryptionKey: IEncryptionKey): Promise<string> {
    let pem: JWK = {
      'kty': 'RSA',
      'kid': 'enc-1bdab3cc.sbx.digital.visa.com',
      'x5t': 'vG5whbId0gPxaln74dF2Iml0n08',
      'n': 'sZPIusDf7yQnnhBkU9mu14VOO3Crui3b7rAf2KYeobURmXA17b1JX9jg0Cd-vgpmuyTrxBUSc-4b0-UPgSwGFqPWUpx08ExqrwPDOvFojBou2wlyq8bcy0Us-BfeCzSE5lMVdSXTXXXcNqu-qb22jCCCJALpxsArsboMOXsLedh3M4XNQ5XGAtRf7b--uTY5Dr9KLYyUvZKAnY04MKJPEO54YiIFM5DTAhNOms089jdMdx-URIKJjPU2-RpHG1u8LCG028RTIpPsNbRanuS5TAY_zlxDgb1hKJ36YbZENHLg9PXTBhdOMlU90DTLlfcbLTa-D7DgljAaWCuvzLPaGw',
      'e': 'AQAB',

    };
    pem = {
      ...pem,
      kty: 'RSA',
      kid: encryptionKey.kid,
      // use: 'enc',
      // alg: 'RSA-OAEP-256',
      // ext_content: 'payload',
    };

    const jwk = await importJWK(pem, 'RSA-OAEP-256');

    return new CompactEncrypt(
      new TextEncoder().encode(JSON.stringify(payload))
    )
      .setProtectedHeader({
        alg: 'RSA-OAEP-256',
        enc: 'A256GCM',
        kid: encryptionKey.kid,
        typ: 'JOSE',
      })
      .encrypt(jwk).catch(e => console.error(e)) as Promise<string>

    // const key = await jose.JWK.asKey(keyInput);
    // const contentAlg = 'A256GCM';
    // const options: EncryptOptions = {
    //   format: 'compact',
    //   contentAlg,
    //   fields: {
    //     kid: key.kid,
    //     typ: 'JOSE',
    //     iat: Date.now(),
    //     alg: key.alg,
    //     enc: contentAlg,
    //   },
    // };
    //
    // return jose.JWE.createEncrypt(options, key)
    //   .update(JSON.stringify(payload))
    //   .final();
  }
}
