import { SrcName } from '../SrcName';
import { ISrcProfileList } from '../ISrc';
import { ICorrelatedMaskedCard } from './ICorrelatedMaskedCard';

export interface IAggregatedProfiles {
  srcProfiles: Partial<Record<SrcName, ISrcProfileList>>;
  aggregatedCards: ICorrelatedMaskedCard[];
}
