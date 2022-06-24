import { CompactEncrypt, importJWK } from 'jose';

const KID = '149123-src-fpan-encryption';

export async function encode(payload: unknown): Promise<string> {
  const encryptionKey = {
    e: 'AQAB',
    n: 'vt4nDSPStTlM1NNcycvIqUf4x14I4jiTqMTKPjGtay0yfa1vByNChmuppDwET5gGGlpL8ccj3YVsBi9_bWoe_appkPwhxd7wR9RywV3zmWuMIhMwlk0lnHAML65nsHVM3oEpEvCfAPs1NXltTyfjnkgFENI3tHqtwdtM8eP02pp0jvW69fybvyVhLzXwSOgJntjtjRV7hQr5led_jWb5zzXI48OVTT_F9iinDdtX5y3E-if5WtGZUFETb_tZFZYnMLaLlHwvb6Zkr84RSwwsMf2nAL_4zP2UahMwzamhBoOSaqyxGxEq67Hr1U8zAC5hl9D8NbgSwpWxsODUrHx9rw',
  }
  const jwk = {
    e: encryptionKey.e,
    n: encryptionKey.n,
    kty: 'RSA',
    kid: KID,
  };

  const importedJWK = await importJWK(jwk, 'RSA-OAEP-256');

  return new CompactEncrypt(
    new TextEncoder().encode(JSON.stringify(payload))
  )
    .setProtectedHeader({
      alg: 'RSA-OAEP-256',
      enc: 'A256GCM',
      kid:KID,
      typ: 'JOSE',
    })
    .encrypt(importedJWK);
}
