import { IClickToPayAdapterInitParams } from '../interfaces/IClickToPayAdapterInitParams';
import { IUpdateView } from '../interfaces/IUpdateView';

export interface IHPPClickToPayAdapterInitParams extends IClickToPayAdapterInitParams {
  formId: string;
  cardListContainerId: string;
  signInContainerId: string;
  onUpdateView: (data: IUpdateView) => void;
}
