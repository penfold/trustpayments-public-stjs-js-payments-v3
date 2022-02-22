import { IClickToPayAdapterInitParams } from './IClickToPayAdapterInitParams';

export interface IClickToPayAdapter<P extends IClickToPayAdapterInitParams, C> {
  init(initParams: P): Promise<C>;
  isRecognized(): Promise<boolean>;
  identifyUser(): Promise<boolean>;
}

