export interface IConsumerIdentityMasterCard {
  consumerIdentity: {
    identityProvider?: string;
    identityValue: string;
    identityType: 'EMAIL_ADDRESS' | 'MOBILE_PHONE_NUMBER'
  };
}
