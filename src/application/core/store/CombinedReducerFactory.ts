import { ContainerInstance, Service } from 'typedi';
import { ReducerToken } from '../../../shared/dependency-injection/InjectionTokens';
import { CombinedReducer } from './CombinedReducer';
import { IReducer } from './IReducer';

@Service()
export class CombinedReducerFactory {
  constructor(private container: ContainerInstance) {}

  getCombinedReducer<T>(): IReducer<T> {
    return new CombinedReducer(this.container.getMany(ReducerToken));
  }
}
