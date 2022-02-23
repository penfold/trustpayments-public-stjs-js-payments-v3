import { IConsumer, IDpaTransactionOptions } from '../ISrc';
import { ICardData } from './ICardData';

export interface IInitialCheckoutData {
  srcDigitalCardId?: string;
  newCardData?: ICardData;
  consumer?: IConsumer;
  dpaTransactionOptions?: IDpaTransactionOptions;
  windowRef?: Window;
}
