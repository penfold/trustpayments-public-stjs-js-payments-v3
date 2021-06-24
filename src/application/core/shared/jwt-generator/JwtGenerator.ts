import { Service } from 'typedi';

@Service()
export class JwtGenerator {
  generate(payload: Record<string, string | number>): string {
    const headerEncoded: string = btoa(JSON.stringify({
      alg: 'none',
    })).replace(/=/g, '');
    const payloadEncoded: string = btoa(JSON.stringify(payload)).replace(/=/g, '');

    return `${headerEncoded}.${payloadEncoded}.`;
  }
}
