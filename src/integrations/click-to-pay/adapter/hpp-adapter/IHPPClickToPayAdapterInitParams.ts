import { IClickToPayAdapterInitParams } from '../interfaces/IClickToPayAdapterInitParams';
import { IUpdateView } from '../interfaces/IUpdateView';
import { ICheckoutResponse } from '../../digital-terminal/ISrc';

export interface IHPPClickToPayAdapterInitParams extends IClickToPayAdapterInitParams {
  formId: string;
  cardListContainerId: string;
  signInContainerId: string;
  loaderId:string;
  cardDetailsSectionId:string,
  ctpSubmitSectionId:string,
  onUpdateView: (data: IUpdateView) => void;
  onCheckout: (data: ICheckoutResponse) => void;
}
