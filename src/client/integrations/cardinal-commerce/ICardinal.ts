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
  on(eventName: string, callback: (...eventData: any[]) => void);
  off(event: string);
  continue(paymentBrand: string, continueObject: IContinueObject, orderObject?: IOrderObject, jwt?: string);
  setup(initializationType: string, initializationData: any);
  start(paymentBrand: string, orderObject: IOrderObject, jwt?: string);
  trigger(eventName: string, ...data: any[]);
  configure(config: any);
}
