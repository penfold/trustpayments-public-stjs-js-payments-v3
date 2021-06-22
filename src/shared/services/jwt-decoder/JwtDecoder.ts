import jwt_decode from 'jwt-decode';
import { IStJwtObj } from '../../../application/core/models/IStJwtObj';
import { Service } from 'typedi';

@Service()
export class JwtDecoder {
  decode<T>(jwt: string): IStJwtObj<T> {
    if (!jwt) {
      throw new Error(`Invalid JWT, undefined or empty string.`);
    }

    try {
      return jwt_decode<IStJwtObj<T>>(jwt);
    } catch (e) {
      throw new Error(`Invalid JWT, cannot parse: ${jwt}.`);
    }
  }
}
