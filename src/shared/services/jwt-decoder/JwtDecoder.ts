import jwt_decode from 'jwt-decode';
import { Service } from 'typedi';
import { IStJwtObj } from '../../../application/core/models/IStJwtObj';

@Service()
export class JwtDecoder {
  decode<T>(jwt: string): IStJwtObj<T> {
    if (!jwt) {
      throw new Error('Invalid JWT, undefined or empty string.');
    }

    try {
      return jwt_decode<IStJwtObj<T>>(jwt);
    } catch (e) {
      throw new Error(`Invalid JWT, cannot parse: ${jwt}.`);
    }
  }
}
