import { Service } from 'typedi';
import { StoreFactory } from '../src/application/core/store/StoreFactory';
import { Store } from 'redux';
import { IStoreAccessor } from './IStoreAccessor';

@Service()
export class SimpleStoreAccessor implements IStoreAccessor {
  private store: Store;
  constructor(private storeFactory: StoreFactory) {}
  getStore(): Store {
    if (!this.store) {
      this.store = this.storeFactory.createStore();
    }

    return this.store;
  }
}
