export interface IStJwtObj<T = unknown> {
  iat?: number;
  aud?: string;
  payload: T;
  sitereference?: string;
}
