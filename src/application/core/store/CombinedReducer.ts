import { IMessageBusEvent } from '../models/IMessageBusEvent';
import { IReducer } from './IReducer';

export class CombinedReducer<T> implements IReducer<T> {
  constructor(private reducers: IReducer<T>[]) {}

  reduce(state: T, action: IMessageBusEvent): T {
    this.reducers.forEach(reducer => {
      state = reducer.reduce(state, action);
    });

    return state;
  }
}
