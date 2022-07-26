import { Service } from 'typedi';
import { SrcName } from './SrcName';
import { ISrcProfileList } from './ISrc';
import { ICorrelatedMaskedCard } from './interfaces/ICorrelatedMaskedCard';

@Service()
export class CardAggregator {
  aggregate(srcProfiles: Partial<Record<SrcName, ISrcProfileList>>): ICorrelatedMaskedCard[] {
    return this.collectAndCorrelateCards(srcProfiles).sort(this.determineCardsOrder.bind(this));
  }

  private collectAndCorrelateCards(srcProfiles: Partial<Record<SrcName, ISrcProfileList>>): ICorrelatedMaskedCard[] {
    const cards: ICorrelatedMaskedCard[] = [];

    Object.entries(srcProfiles).forEach(([srcName, { srcCorrelationId, profiles }]) => {
      profiles.forEach(profile => {
        profile.maskedCards.forEach(maskedCard => {
          cards.push({
            ...maskedCard,
            srcCorrelationId,
            srcName: srcName as SrcName,
            idToken: profile.idToken,
            isActive: maskedCard.digitalCardData.status === 'ACTIVE',
          });
        });
      });
    });

    return cards;
  }

  private determineCardsOrder(cardA: ICorrelatedMaskedCard, cardB: ICorrelatedMaskedCard): number {
    const compare = (valueA = 0, valueB = 0) => Math.sign(valueB - valueA);
    const compareDates = (valueA: string, valueB: string) => Math.sign(new Date(valueB).getTime() - new Date(valueA).getTime());

    return compare(Number(cardA.isActive), Number(cardB.isActive)) ||
      compareDates(cardA.dateOfCardLastUsed, cardB.dateOfCardLastUsed) ||
      compareDates(cardA.dateOfCardCreated, cardB.dateOfCardCreated);
  }
}
