import { IMaskedCard } from '../ISrc';
import { SrcName } from '../SrcName';

export interface ICorrelatedMaskedCard extends IMaskedCard {
  srcCorrelationId: string;
  idToken: string;
  srcName: SrcName;
  isActive: boolean;
}
