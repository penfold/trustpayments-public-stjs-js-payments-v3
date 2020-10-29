import JwtDecode from 'jwt-decode';
import { IStJwtObj } from '../../../application/core/models/IStJwtObj';
import { Service } from 'typedi';

@Service()
export class JwtDecoder {
  decode<T extends IStJwtObj>(jwt: string): T {
    if (!jwt) {
      throw new Error(`Invalid JWT, undefined or empty string.`);
    }

    try {
      return JwtDecode<T>(jwt);
    } catch (e) {
      throw new Error(`Invalid JWT, cannot parse: ${jwt}.`);
    }
  }
}
