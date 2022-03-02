import { ContainerInstance, Service } from 'typedi';
import { ClickToPayAdapterName } from './ClickToPayAdapterName';
import { HPPClickToPayAdapter } from './hpp-adapter/HPPClickToPayAdapter';

@Service()
export class ClickToPayAdapterFactory {
  constructor(private containerInstance: ContainerInstance) {
  }

  create(adapter: ClickToPayAdapterName) {
    if (adapter === ClickToPayAdapterName.hpp) {
      return this.containerInstance.get(HPPClickToPayAdapter);
    }
  }
}
