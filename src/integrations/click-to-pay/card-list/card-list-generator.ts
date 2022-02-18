import { Service } from 'typedi';
import { IconMap } from '../../../application/core/services/icon/IconMap';
import { ICorrelatedMaskedCard } from '../digital-terminal/interfaces/ICorrelatedMaskedCard';

@Service()
export class CardListGenerator {

  constructor(
    private iconMap: IconMap
  ) {
  }

  public displayCards(parentContainer: string, cardList: ICorrelatedMaskedCard[]): void {
    const form: HTMLFormElement = document.createElement('form');
    form.classList.add('cards');
    cardList.forEach(card => {
      const cardContent = this.cardContent(card);
      const cardRow = document.createElement('div');
      cardRow.classList.add('cards__card');
      cardRow.innerHTML = cardContent;
      if (!card.isActive) {
        cardRow.classList.add('cards__card--inactive');
      } else {
        cardRow.addEventListener('click', () => this.handleClick(card.srcDigitalCardId));
      }
      form.appendChild(cardRow);
    });

    const divAddCard = document.createElement('div');
    divAddCard.classList.add('cards__addCard');
    divAddCard.innerHTML = this.addCardContent();
    form.appendChild(divAddCard);

    document.getElementById(parentContainer).appendChild(form);
  }

  private cardContent(card: ICorrelatedMaskedCard): string {
    const s = `
      <span class="cards__card__checkbox">
        <span style='display: none'>${card.isActive ? '<input type="radio" name="card" value="' + card.srcDigitalCardId + '" id="radio' + card.srcDigitalCardId + '">' : ''}</span>${card.isActive ? '<img name="tick" id="tick' + card.srcDigitalCardId + '" src="images/empty.png" alt="">' : ''}
      </span>
      <span class="cards__card__image">
        <img src="${card.digitalCardData.artUri}" alt="" style="width: ${card.digitalCardData.artWidth}px; height: ${card.digitalCardData.artHeight}px">
      </span>
      <span class="cards__card__description">
        VISA<br>
        ..${card.panLastFour}
      </span>
      <span class="cards__card__logo">
        <img src="images/click-to-pay.png" alt="">
      </span>
      <span class="cards__card__type">
        <img src="${this.iconMap.getUrl('visa')}" alt="">
      </span>
    `;
    return s;
  }

  private addCardContent(): string {
    const s = `
      <span class="cards__addCard__label">
        Add new card
      </span>
      <span class="cards__addCard__button">
        <button class="cards__addCard__button" type="button">+</button>
      </span>
    `
    return s;
  }

  private handleClick(id: string): void {
    (document.getElementById('radio' + id) as HTMLInputElement).checked = true;
    (document.getElementsByName('tick')).forEach((element) => {
      (element as HTMLImageElement).src = 'images/empty.png';
    });
    (document.getElementById('tick' + id) as HTMLInputElement).src = 'images/full.png';
  }

}
