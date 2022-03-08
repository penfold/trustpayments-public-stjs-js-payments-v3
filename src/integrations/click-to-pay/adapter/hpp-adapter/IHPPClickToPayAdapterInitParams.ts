import { IClickToPayAdapterInitParams } from '../interfaces/IClickToPayAdapterInitParams';
import { IUpdateView } from '../interfaces/IUpdateView';
import { ICheckoutResponseData } from '../../digital-terminal/ISrc';

export interface IHPPClickToPayAdapterInitParams extends IClickToPayAdapterInitParams {
  formId: string;
  cardListContainerId: string;
  signInContainerId: string;
  onUpdateView: (data: IUpdateView) => void;
  onCheckout: (data: ICheckoutResponseData) => void;
}
