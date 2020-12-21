import { IReducer } from './IReducer';
import { IMessageBusEvent } from '../models/IMessageBusEvent';

export class CallbackReducer<T> implements IReducer<T> {
  constructor(private callback: (state: T, action: IMessageBusEvent) => T) {}

  reduce(state: T, action: IMessageBusEvent): T {
    return this.callback(state, action);
  }
}
