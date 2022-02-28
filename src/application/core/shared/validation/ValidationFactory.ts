import { ContainerInstance, Service } from 'typedi';
import { Validation } from './Validation';

@Service()
export class ValidationFactory {
  constructor(protected containerInstance: ContainerInstance) {}

  create(): Validation{
    return new Validation(this.containerInstance);
  }
}
