import { Service } from 'typedi';
import { FrameAccessor } from '../../../shared/services/message-bus/FrameAccessor';
import { StoreFactory } from './StoreFactory';
import { Store } from 'redux';
import { IControlFrameWindow } from '../../../shared/interfaces/IControlFrameWindow';
import { IStoreAccessor } from '../../../../tests/integration/RequestTypes/IStoreAccessor';

@Service()
export class StoreAccessor implements IStoreAccessor {
  constructor(private frameAccessor: FrameAccessor, private storeFactory: StoreFactory) {}

  getStore(): Store {
    const controlFrame: IControlFrameWindow = this.frameAccessor.getControlFrame();

    if (!controlFrame) {
      throw new Error('Cannot access control-frame');
    }

    if (!controlFrame.stStore) {
      controlFrame.stStore = this.storeFactory.createStore();
    }

    return controlFrame.stStore;
  }
}
