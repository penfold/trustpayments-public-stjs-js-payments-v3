export interface IMessageBusEvent<T = unknown> {
  data?: T;
  type: string;
}
