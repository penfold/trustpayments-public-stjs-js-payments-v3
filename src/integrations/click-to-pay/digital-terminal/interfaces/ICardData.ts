export interface ICardData {
  primaryAccountNumber: string;
  panExpirationMonth: string;
  panExpirationYear: string;
  cardSecurityCode: string;
  cardholderFullName: string;
  cardholderFirstName?: string;
  cardholderLastName?: string;
  billingAddress?: {
    addressId?:string;
    name: string;
    line1:string;
    line2:string;
    line3:string;
    city:string;
    state:string;
    zip:string;
    countryCode:string;
  }
}
