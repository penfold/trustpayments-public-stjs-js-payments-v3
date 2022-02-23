import { ContainerInstance, Service } from 'typedi';
import { Validation } from './Validation';

@Service()
export class ValidationFactory {
  constructor(private containerInstance: ContainerInstance) {}

  create(): Validation{
    console.log(this.containerInstance)
    return new Validation(this.containerInstance);
  }
}
