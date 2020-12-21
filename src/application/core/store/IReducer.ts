import { IMessageBusEvent } from '../models/IMessageBusEvent';

export interface IReducer<T> {
  reduce(state: T, action: IMessageBusEvent): T;
}
