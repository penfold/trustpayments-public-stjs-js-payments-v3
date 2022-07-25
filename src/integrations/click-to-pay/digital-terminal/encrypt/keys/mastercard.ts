import { JWK } from 'jose';

export const MASTERCARD_JWK: JWK = {
  'kty': 'RSA',
  'e': 'AQAB',
  'use': 'enc',
  'kid': '149123-src-fpan-encryption',
  'key_ops': [
    'wrapKey',
    'encrypt',
  ],
  'alg': 'RSA-OAEP-256',
  'n': 'vt4nDSPStTlM1NNcycvIqUf4x14I4jiTqMTKPjGtay0yfa1vByNChmuppDwET5gGGlpL8ccj3YVsBi9_bWoe_appkPwhxd7wR9RywV3zmWuMIhMwlk0lnHAML65nsHVM3oEpEvCfAPs1NXltTyfjnkgFENI3tHqtwdtM8eP02pp0jvW69fybvyVhLzXwSOgJntjtjRV7hQr5led_jWb5zzXI48OVTT_F9iinDdtX5y3E-if5WtGZUFETb_tZFZYnMLaLlHwvb6Zkr84RSwwsMf2nAL_4zP2UahMwzamhBoOSaqyxGxEq67Hr1U8zAC5hl9D8NbgSwpWxsODUrHx9rw',
};
