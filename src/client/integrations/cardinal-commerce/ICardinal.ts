export interface IContinueObject {
  AcsUrl: string;
  Payload: string;
}

export interface IOrderObject {
  Status?: string;
  Cart?: any[];
  OrderDetails?: {
    TransactionId: string;
  };
}

export interface ICardinal {
  on(eventName: string, callback: (...eventData: any[]) => void): void;
  off(event: string): void;
  continue(paymentBrand: string, continueObject: IContinueObject, orderObject?: IOrderObject, jwt?: string): void;
  setup(initializationType: string, initializationData: any): void;
  start(paymentBrand: string, orderObject: IOrderObject, jwt?: string): void;
  trigger(eventName: string, ...data: any[]): void;
  configure(config: any): void;
}
