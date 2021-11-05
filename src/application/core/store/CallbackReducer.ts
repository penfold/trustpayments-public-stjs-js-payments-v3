import { IMessageBusEvent } from '../models/IMessageBusEvent';
import { IReducer } from './IReducer';

export class CallbackReducer<T> implements IReducer<T> {
  constructor(private callback: (state: T, action: IMessageBusEvent) => T) {}

  reduce(state: T, action: IMessageBusEvent): T {
    return this.callback(state, action);
  }
}
