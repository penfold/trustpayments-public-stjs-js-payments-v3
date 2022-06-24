import { IIdentificationResult } from '../../digital-terminal/interfaces/IIdentificationResult';
import { IIdentificationData } from '../../digital-terminal/interfaces/IIdentificationData';
import { SrcName } from '../../digital-terminal/SrcName';
import { IClickToPayAdapterInitParams } from './IClickToPayAdapterInitParams';

export interface IClickToPayAdapter<P extends IClickToPayAdapterInitParams, C> {
  init(initParams: P): Promise<C>;
  isRecognized(): Promise<boolean>;
  identifyUser(identificationData?: IIdentificationData): Promise<IIdentificationResult>;
  getSrcName(pan: string): Promise<SrcName | null>;
}

