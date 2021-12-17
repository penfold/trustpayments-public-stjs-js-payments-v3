export enum TimeoutDetailsType {
  GATEWAY = 'GATEWAY',
  THIRD_PARTY_SDK = 'THIRD_PARTY_SDK',
  THIRD_PARTY_API = 'THIRD_PARTY_API',
}

export interface TimeoutDetails {
  originalError?: Error;
  type?: TimeoutDetailsType;
  requestUrl?: string;
}
