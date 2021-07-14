export interface IContinueObject {
  AcsUrl: string;
  Payload: string;
}

export interface IOrderObject {
  Status?: string;
  Cart?: unknown[];
  OrderDetails?: {
    TransactionId: string;
  };
}

export interface ICardinal {
  on(eventName: string, callback: (...eventData: unknown[]) => void): void;
  off(event: string): void;
  continue(paymentBrand: string, continueObject: IContinueObject, orderObject?: IOrderObject, jwt?: string): void;
  setup(initializationType: string, initializationData: unknown): void;
  start(paymentBrand: string, orderObject: IOrderObject, jwt?: string): void;
  trigger(eventName: string, ...data: unknown[]): void;
  configure(config: unknown): void;
}
