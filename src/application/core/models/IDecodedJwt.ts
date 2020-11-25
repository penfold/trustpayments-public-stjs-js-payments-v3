import { IStJwtPayload } from './IStJwtPayload';

export interface IDecodedJwt {
  iat?: number;
  iss?: string;
  payload: IStJwtPayload;
}
