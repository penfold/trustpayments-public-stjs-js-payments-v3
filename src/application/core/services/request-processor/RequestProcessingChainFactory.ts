import { ContainerInstance, Service } from 'typedi';
import { TransportService } from '../st-transport/TransportService';
import { IRequestProcessor } from './IRequestProcessor';
import { IResponseProcessor } from './IResponseProcessor';
import { RequestProcessingChain } from './RequestProcessingChain';
import { IErrorHandler } from './IErrorHandler';

@Service()
export class RequestProcessingChainFactory {
  constructor(
    private transportService: TransportService,
    private container: ContainerInstance,
  ) {
  }

  create(
    requestProcessors: (new (...args: unknown[]) => IRequestProcessor)[],
    responseProcessors: (new (...args: unknown[]) => IResponseProcessor)[],
    errorHandler?: (new (...args: unknown[]) => IErrorHandler),
  ): RequestProcessingChain {
    return new RequestProcessingChain(
      requestProcessors.map(type => this.container.get(type)),
      responseProcessors.map(type => this.container.get(type)),
      this.transportService,
      errorHandler ? this.container.get(errorHandler) : undefined,
    );
  }
}
