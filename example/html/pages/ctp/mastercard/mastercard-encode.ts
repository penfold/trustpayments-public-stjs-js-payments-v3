import * as jose from 'node-jose';

const KID = '149123-src-fpan-encryption';

export async function encode(payload: unknown): Promise<string> {
  const pem = {
    e: 'AQAB',
    n: 'vt4nDSPStTlM1NNcycvIqUf4x14I4jiTqMTKPjGtay0yfa1vByNChmuppDwET5gGGlpL8ccj3YVsBi9_bWoe_appkPwhxd7wR9RywV3zmWuMIhMwlk0lnHAML65nsHVM3oEpEvCfAPs1NXltTyfjnkgFENI3tHqtwdtM8eP02pp0jvW69fybvyVhLzXwSOgJntjtjRV7hQr5led_jWb5zzXI48OVTT_F9iinDdtX5y3E-if5WtGZUFETb_tZFZYnMLaLlHwvb6Zkr84RSwwsMf2nAL_4zP2UahMwzamhBoOSaqyxGxEq67Hr1U8zAC5hl9D8NbgSwpWxsODUrHx9rw',
  }

  const keyInput = {
    kty: 'RSA',
    e: pem.e, // Public key exponent
    n: pem.n, // Public key modulus
    kid: KID,
    use: 'enc',
    alg: 'RSA-OAEP-256',
    ext_content: 'payload',
  };

  const key = await jose.JWK.asKey(keyInput);
  const contentAlg = 'A256GCM';
  const options = {
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

  return await jose.JWE.createEncrypt(options, key)
    .update(JSON.stringify(payload))
    .final();
}
