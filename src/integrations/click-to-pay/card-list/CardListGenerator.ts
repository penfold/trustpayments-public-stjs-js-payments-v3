import { Service } from 'typedi';
import { BehaviorSubject, Subscription } from 'rxjs';
import { distinctUntilChanged, first } from 'rxjs/operators';
import { ICorrelatedMaskedCard } from '../digital-terminal/interfaces/ICorrelatedMaskedCard';
import { SrcNameFinder } from '../digital-terminal/SrcNameFinder';
import { DigitalTerminal } from '../digital-terminal/DigitalTerminal';
import { SrcName } from '../digital-terminal/SrcName';
import { ISrcProfileList } from '../digital-terminal/ISrc';
import { ITranslator } from '../../../application/core/shared/translator/ITranslator';
import { HPPUpdateViewCallback } from '../adapter/hpp-adapter/HPPUpdateViewCallback';
import { NewCardFieldName } from './NewCardFieldName';
import './CardListGenerator.scss';

const logo = require('../../../application/core/services/icon/images/ctp-visa.svg');

const PAN_VALIDATION_STATUS_FAILED = 'Selected card is not currently supported for Click to Pay';

@Service()
export class CardListGenerator {
  private acceptedCards: SrcName[] = [SrcName.VISA];
  private notYouElementId = 'st-ctp-user-details__not--you';
  private panValidationStatus: BehaviorSubject<boolean> = new BehaviorSubject(true);
  private panValidationStatusSubscription: Subscription;
  private cardList: ICorrelatedMaskedCard[];

  private readonly iconMap: Map<string, string> = new Map([
    ['visa', require('../../../application/core/services/icon/images/ctp-visa.svg')],
  ]);

  constructor(
    private digitalTerminal: DigitalTerminal,
    private translator: ITranslator,
    private srcNameFinder: SrcNameFinder,
    private hppUpdateViewCallback: HPPUpdateViewCallback
  ) {
  }

  displayCards(formId: string, parentContainer: string, cardList: ICorrelatedMaskedCard[]): void {
    const container: HTMLElement = document.getElementById(parentContainer);
    container.classList.add('st-cards');
    container.innerHTML = '';
    this.cardList = cardList;
    cardList.forEach((card, index) => {
      const cardContent = this.cardContent(card, index === 0);
      const cardRow = document.createElement('div');
      cardRow.classList.add('st-card');
      cardRow.innerHTML = cardContent;
      if (index !== 0) {
        cardRow.classList.add('st-card--hidden');
      }
      if (!card.isActive) {
        cardRow.classList.add('st-card--inactive');
      } else {
        cardRow.addEventListener('click', () => this.handleClick(card.srcDigitalCardId));
      }
      container.appendChild(cardRow);
    });

    const viewAllCards = document.createElement('div');
    viewAllCards.classList.add('st-view-all-cards');
    viewAllCards.innerHTML = this.viewAllCards();
    container.appendChild(viewAllCards);

    const addCardRow = document.createElement('div');
    addCardRow.classList.add('st-add-card');
    addCardRow.innerHTML = this.addCardContent();
    container.appendChild(addCardRow);

    this.addValidation();
    this.fillUpExpiryMonth();
    this.fillUpExpiryYear();
    this.addEventHandlers(formId);
  }

  displayUserInformation(parentContainer: string, userInformation: Partial<Record<SrcName, ISrcProfileList>>): void {
    const container: HTMLElement = document.getElementById(parentContainer);
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.addUserInformationContent(
      userInformation[Object.keys(userInformation)[0]].profiles[0].maskedConsumer.emailAddress
    );
    container.prepend(wrapper);
    document
      .getElementById(this.notYouElementId)
      .addEventListener('click', () => this.digitalTerminal.unbindAppInstance().subscribe(() => this.hideForm()));
    this.addEventHandlersToUserInformation();
  }

  openNewCardForm(): void {
    this.openForm();
    this.clearSelection();
  }

  hideForm(): void {
    document.getElementById('st-ctp-cards').innerHTML = '';
    this.hppUpdateViewCallback.callUpdateViewCallback({
      displayCardForm: true,
      displaySubmitButton: true,
      displayMaskedCardNumber: null,
      displayCardType: null,
    });
  }

  reset() {
    this.clearForm();
    this.clearSelection();
  }

  private addCardContent(): string {
    return `
      <div class='st-add-card__label'>
        <span class='st-add-card__label st-add-card__button' id='st-add-card__button'>
          +&emsp;${this.translator.translate('Add a card')}
        </span>
        <span class='st-add-card__label st-add-card__title' id='st-add-card__title'>
          ${this.translator.translate('Add new card')}
        </span>
      </div>
      <div class='st-add-card__details'>
        Card number <span class='st-add-card__details-asterix'></span>
        <input id='vctp-pan' type='text' autocomplete='off' name='${NewCardFieldName.pan}'>
        <div id='vctp-pan-validation-status' class='st-add-card__pan-validation'></div>
      </div>
      <div class='st-add-card__details'>
        <span class='st-add-card__details-element'>
          Expiry date <span class='st-add-card__details-asterix'></span>
          <select id='vctp-expiryDateMonthId' autocomplete='off' name='${NewCardFieldName.expiryMonth}'></select>
        </span>
        <span class='st-add-card__details-element'>
          <select id='vctp-expiryDateYearId' autocomplete='off' name='${NewCardFieldName.expiryYear}'></select>
        </span>
      </div>
      <div class='st-add-card__details'>
        Security code <span class='st-add-card__details-asterix'></span><br>
        <input id='vctp-cvv' maxlength='3' autocomplete='off' name='${NewCardFieldName.securityCode}' type='text'>
      </div>
    `;
  }

  private viewAllCards(): string {
    return `
      <div class='st-add-card__label'>
        <span class='st-add-card__label' id='st-view-all-card__button'>
          ${this.translator.translate('View all cards')}
        </span>
      </div>
    `;
  }

  private addEventHandlers(formId: string): void {
    document
      .getElementById(formId)
      .querySelector('input[name=' + NewCardFieldName.pan + ']')
      .addEventListener('change', event => this.handleChangedPan(event));
    document.getElementById('st-add-card__button').addEventListener('click', () => this.handleAddCardButtonClick());
    document.getElementById('st-view-all-card__button').addEventListener('click', () => this.handleViewAllCardButtonClick());
  }

  private addEventHandlersToUserInformation(): void {
  }

  private addUserInformationContent(emailAddress: string): string {
    return `
      <div class='st-ctp-enabled-by'>
        <img src='${logo}' class='st-ctp-prompt__logo-img' alt=''>
      </div>
      <div id='st-ctp-user-details__wrapper' class='st-ctp-user-details__wrapper'>
        ${emailAddress} <span id='st-ctp-user-details__not--you' class='st-ctp-user-details-not-you'>${this.translator.translate('Not you?')}</span>
      </div>
    `;
  }

  private addValidation(): void {
    if (this.panValidationStatusSubscription) {
      this.panValidationStatusSubscription.unsubscribe();
    }
    this.panValidationStatusSubscription = this.panValidationStatus
      .pipe(distinctUntilChanged())
      .subscribe(result =>
        result
          ? this.hideValidationStatus('vctp-pan-validation-status')
          : this.showValidationStatus('vctp-pan-validation-status', PAN_VALIDATION_STATUS_FAILED)
      );
  }

  private cardContent(card: ICorrelatedMaskedCard, checked = false): string {
    const check = checked ? ' checked' : '';

    if (checked) {
      this.hppUpdateViewCallback.callUpdateViewCallback({
        displayMaskedCardNumber: card.panLastFour.toString(),
        displayCardType: card.srcName.toLowerCase(),
        displayCardForm: false,
        displaySubmitButton: true,
      });

    }

    return `
      <span class='st-card__checkbox'>${
      card.isActive
        ? '<label><input id="radio' +
        card.srcDigitalCardId +
        '" name="srcDigitalCardId" class="st-card__checkbox-input" type="radio" value="' +
        card.srcDigitalCardId +
        '"' +
        check +
        '><span class="st-card__checkbox-radio"></span></label>'
        : ''
    }</span>
      <span class='st-card__image'>
        <img src='${card.digitalCardData.artUri}' alt='' style='width: 60px; height: 40px'>
      </span>
      <span class='st-card__description'>
        ${card.srcName}<br>
        ..${card.panLastFour}
      </span>
      <span class='st-card__logo'>
          <img src='${this.iconMap.get(card.srcName.toLowerCase())}' alt=''>
      </span>
    `;
  }

  private clearForm(): void {
    const newCardFormFieldNames = [NewCardFieldName.pan, NewCardFieldName.securityCode, NewCardFieldName.expiryYear, NewCardFieldName.expiryMonth];

    newCardFormFieldNames
      .map(name => document.querySelector(`[name="${name}"]`))
      .filter(Boolean)
      .forEach((inputElement: HTMLInputElement | HTMLSelectElement) => inputElement.value = '');
    this.panValidationStatus.next(true);
  }

  private clearSelection(): void {
    document.getElementsByName('srcDigitalCardId').forEach((element: HTMLInputElement) => {
      element.checked = false;
    });

    if (document.getElementsByName('srcDigitalCardId')?.length) {
      this.hppUpdateViewCallback.callUpdateViewCallback({
        displayMaskedCardNumber: null,
        displayCardType: null,
        displayCardForm: false,
        displaySubmitButton: true,
      });
    }
  }

  private fillUpExpiryMonth(): void {
    const select = document.getElementById('vctp-expiryDateMonthId');
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
    const select = document.getElementById('vctp-expiryDateYearId');
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
    this.hppUpdateViewCallback.callUpdateViewCallback({
      displayMaskedCardNumber: null,
      displayCardType: null,
      displayCardForm: false,
      displaySubmitButton: true,
    });
    this.openForm();
    this.clearSelection();
  }

  private handleViewAllCardButtonClick(): void {
    document.getElementById('st-view-all-card__button').remove();
    document.querySelectorAll('div.st-card--hidden').forEach(e => {
      (e as HTMLDivElement).classList.remove('st-card--hidden');
    });
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
    const checkboxElement = document.getElementById('radio' + id) as HTMLInputElement;
    checkboxElement.checked = true;
    const selectedCard = this.cardList.filter(card => card.srcDigitalCardId === id);

    this.hppUpdateViewCallback.callUpdateViewCallback({
      displayMaskedCardNumber: selectedCard[0].panLastFour.toString(),
      displayCardType: selectedCard[0].srcName.toLowerCase(),
      displayCardForm: false,
      displaySubmitButton: true,
    });
  }

  private hideValidationStatus(id: string) {
    document.getElementById(id).style.display = 'none';
    document.getElementById(id).innerHTML = '';
  }

  private openForm(): void {
    if(!document.getElementById('st-add-card__button')){
      return
    }

    document.querySelector('.st-add-card').classList.add('st-add-card--open');
    document.getElementById('st-add-card__button').style.display = 'none';
    document.getElementById('st-add-card__title').style.display = 'block';
    document.querySelectorAll('div.st-add-card__details').forEach(div => {
      (div as HTMLDivElement).style.display = 'block';
    });
    this.toggleNewCardFormValidation(true);
  }

  private closeForm(): void {
    document.querySelector('.st-add-card').classList.remove('st-add-card--open');
    document.getElementById('st-add-card__button').style.display = 'block';
    document.getElementById('st-add-card__title').style.display = 'none';
    document.querySelectorAll('div.st-add-card__details').forEach(div => {
      (div as HTMLDivElement).style.display = 'none';
    });
    this.toggleNewCardFormValidation(false);
  }

  private showValidationStatus(id: string, message: string) {
    document.getElementById(id).style.display = 'block';
    document.getElementById(id).innerHTML = message;
  }

  private toggleNewCardFormValidation(enabled: boolean) {
    const cardFieldNames: NewCardFieldName[] = [
      NewCardFieldName.pan,
      NewCardFieldName.expiryYear,
      NewCardFieldName.expiryMonth,
      NewCardFieldName.securityCode,
    ];

    cardFieldNames.forEach(fieldName => {
      const fieldElement = document.querySelector(`[name="${fieldName}"]`) as Element;
      if (enabled) {
        fieldElement?.setAttribute('required','required');
      } else {
        fieldElement?.removeAttribute('required');
      }
    });
  }
}
