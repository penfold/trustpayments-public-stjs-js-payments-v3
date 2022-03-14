import { Service } from 'typedi';
import { ICorrelatedMaskedCard } from '../digital-terminal/interfaces/ICorrelatedMaskedCard';
// @ts-ignore
import logo from '../../../application/core/services/icon/images/click-to-pay.svg';
import { DigitalTerminal } from '../digital-terminal/DigitalTerminal';
import { SrcName } from '../digital-terminal/SrcName';
import { ISrcProfileList } from '../digital-terminal/ISrc';
import { ITranslator } from '../../../application/core/shared/translator/ITranslator';
import { NewCardFieldName } from './NewCardFieldName';

const iconMap: Map<string, string> = new Map(
  [
    ['visa', require('../../../application/core/services/icon/images/visa.svg')],
  ]
);

@Service()
export class CardListGenerator {
  private notYouElementId = 'st-ctp-user-details__not--you';

  constructor(private digitalTerminal: DigitalTerminal, private translator: ITranslator) {
  }

  displayCards(parentContainer: string, cardList: ICorrelatedMaskedCard[]): void {
    const container: HTMLElement = document.getElementById(parentContainer);
    container.classList.add('st-cards');
    cardList.forEach((card, index) => {
      const cardContent = this.cardContent(card, index === 0);
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
    addCardRow.classList.add('st-add-card');
    addCardRow.innerHTML = this.addCardContent();
    container.appendChild(addCardRow);

    this.fillUpExpiryMonth();
    this.fillUpExpiryYear();
    this.addEventHandlers();
  }

  openNewCardForm(): void {
    this.openForm();
    this.clearSelection();
  }

  private addCardContent(): string {
    return `
      <div class="st-add-card__label">
        <span class="st-add-card__label">
          ${this.translator.translate('Add new card')}
        </span>
        <span class="st-add-card__button">
          <button id="st-add-card__button" class="st-add-card__button" type="button">+</button>
        </span>
      </div>
      <div class="st-add-card__details">
        Card number <span class="st-add-card__details-asterix"></span>
        <input id="pan" type="text" name="${NewCardFieldName.pan}">
      </div>
      <div class="st-add-card__details">
        <span class="st-add-card__details-element">
          Expiry date <span class="st-add-card__details-asterix"></span>
          <select id="expiryDateMonthId" name="${NewCardFieldName.expiryMonth}"></select>
        </span>
        <span class="st-add-card__details-element">
          <select id="expiryDateYearId" name="${NewCardFieldName.expiryYear}"></select>
        </span>
      </div>
      <div class="st-add-card__details">
        Security code <span class="st-add-card__details-asterix"></span><br>
        <input id="cvv" maxlength="3" name="${NewCardFieldName.securityCode}" type="text">
      </div>
    `;
  }

  private addEventHandlers(): void {
    document.getElementById('st-add-card__button').addEventListener('click', () => this.openNewCardForm());
  }

  private cardContent(card: ICorrelatedMaskedCard, checked = false): string {
    const check = checked ? ' checked' : '';
    const activeCardRadioButton = `<label><input id="radio${card.srcDigitalCardId}" name="srcDigitalCardId" class="st-card__checkbox-input" type="radio" value="${card.srcDigitalCardId}"${check}><span class="st-card__checkbox-radio"></span></label>`;

    return `
      <span class="st-card__checkbox">${card.isActive ? activeCardRadioButton : ''}</span>
      <span class="st-card__image">
        <img src="${card.digitalCardData.artUri}" alt="" style="width: 60px; height: 40px">
      </span>
      <span class="st-card__description">
        ${card.srcName}<br>
        ..${card.panLastFour}
      </span>
      <span class="st-card__logo">
        <img src="${logo}" alt="">
      </span>
      <span class="st-card__type">
        <img src="${iconMap.get(card.srcName.toLowerCase())}" alt="">
      </span>
    `;
  }

  private clearForm(): void {
    (document.getElementById('cvv') as HTMLInputElement).value = '';
    (document.getElementById('pan') as HTMLInputElement).value = '';
    (document.getElementById('expiryDateMonthId') as HTMLSelectElement).value = '';
    (document.getElementById('expiryDateYearId') as HTMLSelectElement).value = '';
  }

  private clearSelection(): void {
    document.getElementsByName('srcDigitalCardId').forEach((element: HTMLInputElement) => {
      element.checked = false;
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
    const select = document.getElementById('expiryDateMonthId');
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
    const select = document.getElementById('expiryDateYearId');
    const currentYear = new Date().getFullYear();
    const option = document.createElement('option') as HTMLOptionElement;
    option.value = option.innerHTML = '';
    select.appendChild(option);
    for (let i = currentYear; i < currentYear + 21; i++) {
      const option = document.createElement('option') as HTMLOptionElement;
      option.value = option.innerHTML = i.toString();
      select.appendChild(option);
    }
  }

  private handleClick(id: string): void {
    this.closeForm();
    this.clearForm();
    this.clearSelection();
    (document.getElementById('radio' + id) as HTMLInputElement).checked = true;
  }

  private openForm(): void {
    document.getElementById('st-add-card__button').style.visibility = 'hidden';
    const formRows = document.getElementsByClassName('st-add-card__details');
    for (let i = 0; i < formRows.length; i++) {
      (formRows[i] as HTMLDivElement).style.display = 'block';
    }
  }

  displayUserInformation(parentContainer: string, userInformation: Partial<Record<SrcName, ISrcProfileList>>): void {
    const container: HTMLElement = document.getElementById(parentContainer);
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.addUserInformationContent(userInformation[Object.keys(userInformation)[0]].profiles[0].maskedConsumer.emailAddress);
    container.prepend(wrapper);
    document.getElementById(this.notYouElementId).addEventListener('click', () => this.digitalTerminal.unbindAppInstance().subscribe(() => this.hideForm()));
  }

  private addUserInformationContent(emailAddress: string): string {
    return `
      <div id="st-ctp-user-details__wrapper" class="st-ctp-user-details__wrapper">
        <?xml version="1.0" encoding="UTF-8"?>
        <svg class="st-ctp-user-details__image" enable-background="new 0 0 258.75 258.75" version="1.1" viewBox="0 0 258.75 258.75" xml:space="preserve" xmlns="http://www.w3.org/2000/svg">
          <circle cx="129.38" cy="60" r="60"/>
          <path d="m129.38 150c-60.061 0-108.75 48.689-108.75 108.75h217.5c0-60.061-48.689-108.75-108.75-108.75z"/>
        </svg>
        <p class="st-ctp-user-details__information">${this.translator.translate('Hello')} ${emailAddress} <span id="st-ctp-user-details__not--you" class="st-ctp-user-details__not--you">${this.translator.translate('Not you?')}</span></p>
      </div>
    `;
  }

  private hideForm(): void {
    document.getElementById('st-ctp-cards').innerHTML = '';
    //onUpdateView
  }
}
