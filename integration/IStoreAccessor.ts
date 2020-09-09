import { Store } from 'redux';

export abstract class IStoreAccessor {
  abstract getStore(): Store;
}
