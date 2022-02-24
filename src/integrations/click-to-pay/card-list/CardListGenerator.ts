import { Service } from 'typedi';
import { IconMap } from '../../../application/core/services/icon/IconMap';
import { ICorrelatedMaskedCard } from '../digital-terminal/interfaces/ICorrelatedMaskedCard';

@Service()
export class CardListGenerator {
  constructor(
    private iconMap: IconMap
  ) {
  }

  displayCards(parentContainer: string, cardList: ICorrelatedMaskedCard[]): void {
    const container: HTMLElement = document.getElementById(parentContainer);
    container.classList.add('st-cards');
    cardList.forEach(card => {
      const cardContent = this.cardContent(card);
      const cardRow = document.createElement('div');
      cardRow.classList.add('st-card');
      cardRow.innerHTML = cardContent;
      if (!card.isActive) {
        cardRow.classList.add('st-card--inactive');
      } else {
        cardRow.addEventListener('click', () => this.handleClick(card.srcDigitalCardId));
      }
      container.appendChild(cardRow);
    });

    const addCardRow = document.createElement('div');
    addCardRow.classList.add('st-addCard');
    addCardRow.innerHTML = this.addCardContent();
    container.appendChild(addCardRow);

    this.fillUpExpiryMonth();
    this.fillUpExpiryYear();
    this.addEventHandlers();
  }

  private addCardContent(): string {
    return `
      <div class="st-add-card__label">
        <span class="st-addCard__label">
          Add new card
        </span>
        <span class="st-addCard__button">
          <button id="st-add-card__button" class="st-addCard__button" type="button">+</button>
        </span>
      </div>
      <div class="st-add-card__details">
        Card number
        <input id="pan" type="text" name="pan">
      </div>
      <div class="st-add-card__details">
        <span class="st-add-card__details-element">
          Expiry date
          <select id="expiryDateMonth" name="expiryDateMonth"></select>
        </span>
        <span class="st-add-card__details-element">
          <select id="expiryDateYear" name="expiryDateYear"></select>
        </span>
      </div>
      <div class="st-add-card__details">
        Security code<br>
        <input id="cvv" maxlength="3" name="cvv" type="text">
      </div>
    `;
  }

  private addEventHandlers(): void {
    document.getElementById('cvv').addEventListener('focus', () => this.handleFocus());
    document.getElementById('expiryDateMonth').addEventListener('focus', () => this.handleFocus());
    document.getElementById('expiryDateYear').addEventListener('focus', () => this.handleFocus());
    document.getElementById('pan').addEventListener('focus', () => this.handleFocus());
    document.getElementById('st-add-card__button').addEventListener('click', () => this.handleAddCardButtonClick());
  }

  private cardContent(card: ICorrelatedMaskedCard): string {
    return `
      <span class="st-card__checkbox">
        <span style='display: none'>${card.isActive ? '<input type="radio" name="srcDigitalCardId" value="' + card.srcDigitalCardId + '" id="radio' + card.srcDigitalCardId + '">' : ''}</span>${card.isActive ? '<span class="st-card__tick" id="tick' + card.srcDigitalCardId + '" name="tick"></span>' : ''}
      </span>
      <span class="st-card__image">
        <img src="${card.digitalCardData.artUri}" alt="" style="width: ${card.digitalCardData.artWidth}px; height: ${card.digitalCardData.artHeight}px">
      </span>
      <span class="st-card__description">
        ${card.srcName}<br>
        ..${card.panLastFour}
      </span>
      <span class="st-card__logo">
        <img src="images/click-to-pay.png" alt="">
      </span>
      <span class="st-card__type">
        <img src="${this.iconMap.getUrl(card.srcName.toLowerCase())}" alt="">
      </span>
    `;
  }

  private clearForm(): void {
    (document.getElementById('cvv') as HTMLInputElement).value = '';
    (document.getElementById('pan') as HTMLInputElement).value = '';
    (document.getElementById('expiryDateMonth') as HTMLSelectElement).value = '';
    (document.getElementById('expiryDateYear') as HTMLSelectElement).value = '';
  }

  private clearSelection(): void {
    document.getElementsByName('tick').forEach((element: HTMLSpanElement) => {
      console.log('usuwam', element);
      element.classList.remove('st-card__tick--selected');
    });
  }

  private closeForm(): void {
    document.getElementById('st-add-card__button').style.visibility = 'visible';
    const formRows = document.getElementsByClassName('st-add-card__details');
    for (let i = 0; i < formRows.length; i++) {
      (formRows[i] as HTMLDivElement).style.display = 'none';
    }
  }

  private fillUpExpiryMonth(): void {
    const select = document.getElementsByName('expiryDateMonth')[0];
    const option = document.createElement('option') as HTMLOptionElement;
    option.value = option.innerHTML = '';
    select.appendChild(option);
    for (let i = 0; i < 12; i++) {
      const option = document.createElement('option') as HTMLOptionElement;
      option.value = (i + 1).toString();
      option.innerHTML = option.value.padStart(2, '0');
      select.appendChild(option);
    }
  }

  private fillUpExpiryYear(): void {
    const select = document.getElementsByName('expiryDateYear')[0];
    const currentYear = new Date().getFullYear();
    const option = document.createElement('option') as HTMLOptionElement;
    option.value = option.innerHTML = '';
    select.appendChild(option);
    for (let i = currentYear; i < currentYear + 6; i++) {
      const option = document.createElement('option') as HTMLOptionElement;
      option.value = option.innerHTML = i.toString();
      select.appendChild(option);
    }
  }

  private handleAddCardButtonClick(): void {
    this.openForm();
  }

  private handleClick(id: string): void {
    this.closeForm();
    this.clearForm();
    this.clearSelection();
    (document.getElementById('radio' + id) as HTMLInputElement).checked = true;
    (document.getElementById('tick' + id) as HTMLSpanElement).classList.add('st-card__tick--selected');
  }

  private handleFocus(): void {
    this.clearSelection();
  }

  private openForm(): void {
    document.getElementById('st-add-card__button').style.visibility = 'hidden';
    const formRows = document.getElementsByClassName('st-add-card__details');
    for (let i = 0; i < formRows.length; i++) {
      (formRows[i] as HTMLDivElement).style.display = 'block';
    }
  }

}
