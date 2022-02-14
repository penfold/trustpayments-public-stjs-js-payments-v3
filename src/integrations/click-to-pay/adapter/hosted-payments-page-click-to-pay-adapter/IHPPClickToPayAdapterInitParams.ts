import { IClickToPayAdapterInitParams } from '../IClickToPayAdapterInitParams';

export interface IHPPClickToPayAdapterInitParams extends IClickToPayAdapterInitParams {
  formId: string;
  cardListContainerId: string;
}
