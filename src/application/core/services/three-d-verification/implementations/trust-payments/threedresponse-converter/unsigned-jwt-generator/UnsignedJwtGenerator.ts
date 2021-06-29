import { Service } from 'typedi';

@Service()
export class UnsignedJwtGenerator {
  generate(payload: Record<string, unknown>): string {
    const headerEncoded = this.encode({ alg: 'none' });
    const payloadEncoded = this.encode(payload);

    return `${headerEncoded}.${payloadEncoded}.`;
  }

  private encode(data: Record<string, unknown>): string {
    return btoa(JSON.stringify(data)).replace(/=$/, '');
  }
}
