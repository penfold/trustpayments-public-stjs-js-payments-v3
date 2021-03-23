export interface IStJwtObj<T = any> {
  iat?: number;
  aud?: string;
  payload: T;
  sitereference?: string;
}
