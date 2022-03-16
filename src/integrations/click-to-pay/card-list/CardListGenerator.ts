import { Service } from 'typedi';
import { BehaviorSubject, Subscription } from 'rxjs';
import { distinctUntilChanged, first } from 'rxjs/operators';
import { ICorrelatedMaskedCard } from '../digital-terminal/interfaces/ICorrelatedMaskedCard';
// @ts-ignore
import logo from '../../../application/core/services/icon/images/click-to-pay.svg';
import { SrcNameFinder } from '../digital-terminal/SrcNameFinder';
import { DigitalTerminal } from '../digital-terminal/DigitalTerminal';
import { SrcName } from '../digital-terminal/SrcName';
import { ISrcProfileList } from '../digital-terminal/ISrc';
import { ITranslator } from '../../../application/core/shared/translator/ITranslator';

const PAN_VALIDATION_STATUS_FAILED = 'Selected card is not currently supported for Click to Pay';

@Service()
export class CardListGenerator {
  private acceptedCards: SrcName[] = [SrcName.VISA];
  private formId: string;
  private notYouElementId = 'st-ctp-user-details__not--you';
  private panValidationStatus: BehaviorSubject<boolean> = new BehaviorSubject(true);
  private panValidationStatusSubscribtion: Subscription;

  private readonly iconMap: Map<string, string> = new Map([
    ['visa', require('../../../application/core/services/icon/images/visa.svg')],
  ]);

  constructor(private digitalTerminal: DigitalTerminal, private translator: ITranslator, private srcNameFinder: SrcNameFinder) {}

  displayCards(formId: string, parentContainer: string, cardList: ICorrelatedMaskedCard[]): void {
    this.formId = formId;
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

    this.addValidation();
    this.fillUpExpiryMonth();
    this.fillUpExpiryYear();
    this.addEventHandlers();
  }

  displayUserInformation(parentContainer: string, userInformation: Partial<Record<SrcName, ISrcProfileList>>): void {
    const container: HTMLElement = document.getElementById(parentContainer);
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.addUserInformationContent(userInformation[Object.keys(userInformation)[0]].profiles[0].maskedConsumer.emailAddress);
    container.prepend(wrapper);
    document.getElementById(this.notYouElementId).addEventListener('click', () => this.digitalTerminal.unbindAppInstance().subscribe(() => this.hideForm()));
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
        <input id="pan" type="text" name="pan">
        <div id="pan-validation-status" class="st-add-card__pan-validation"></div>
      </div>
      <div class="st-add-card__details">
        <span class="st-add-card__details-element">
          Expiry date <span class="st-add-card__details-asterix"></span>
          <select id="expiryDateMonthId" name="expiryDateMonth"></select>
        </span>
        <span class="st-add-card__details-element">
          <select id="expiryDateYearId" name="expiryDateYear"></select>
        </span>
      </div>
      <div class="st-add-card__details">
        Security code <span class="st-add-card__details-asterix"></span><br>
        <input id="cvv" maxlength="3" name="cvv" type="text">
      </div>
    `;
  }

  private addEventHandlers(): void {
    document.getElementById(this.formId).querySelector('input[name="pan"]').addEventListener('change', event => this.handleChangedPan(event));
    document.getElementById('st-add-card__button').addEventListener('click', () => this.handleAddCardButtonClick());
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
    `
  }

  private addValidation(): void {
    if (this.panValidationStatusSubscribtion) {
      this.panValidationStatusSubscribtion.unsubscribe();
    }
    this.panValidationStatusSubscribtion = this.panValidationStatus
      .pipe(
        distinctUntilChanged()
      )
      .subscribe(result =>
        result
          ? this.hideValidationStatus('pan-validation-status')
          : this.showValidationStatus('pan-validation-status', PAN_VALIDATION_STATUS_FAILED)
      );
  }

  private cardContent(card: ICorrelatedMaskedCard, checked = false): string {
    const check = checked ? ' checked' : '';
    return `
      <span class="st-card__checkbox">${
        card.isActive
          ? '<label><input id="radio' +
            card.srcDigitalCardId +
            '" name="srcDigitalCardId" type="radio" value="' +
            card.srcDigitalCardId +
            '"' +
            check +
            '><span class="radio"></span></label>'
          : ''
      }</span>
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
        <img src="${this.iconMap.get(card.srcName.toLowerCase())}" alt="">
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

  private handleAddCardButtonClick(): void {
    this.openForm();
    this.clearSelection();
  }

  private handleChangedPan(event: Event): void {
    if ((event.target as HTMLInputElement).value) {
      this.srcNameFinder
        .findSrcNameByPan((event.target as HTMLInputElement).value)
        .pipe(first())
        .subscribe((result: SrcName | null) => {
          this.panValidationStatus.next(this.acceptedCards.indexOf(result) !== -1);
        });
    } else {
      this.panValidationStatus.next(true);
    }
  }

  private handleClick(id: string): void {
    this.closeForm();
    this.clearForm();
    this.clearSelection();
    (document.getElementById('radio' + id) as HTMLInputElement).checked = true;
  }

  private hideValidationStatus(id: string) {
    document.getElementById(id).style.display = 'none';
    document.getElementById(id).innerHTML = '';
  }

  private openForm(): void {
    document.getElementById('st-add-card__button').style.visibility = 'hidden';
    const formRows = document.getElementsByClassName('st-add-card__details');
    for (let i = 0; i < formRows.length; i++) {
      (formRows[i] as HTMLDivElement).style.display = 'block';
    }
  }

  private hideForm(): void {
    document.getElementById('st-ctp-cards').innerHTML = '';
    //onUpdateView
  }
  private showValidationStatus(id: string, message: string) {
    document.getElementById(id).style.display = 'block';
    document.getElementById(id).innerHTML = message;
  }

}
