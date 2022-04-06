import { fromEvent, Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { ITranslator } from '../../../../../application/core/shared/translator/ITranslator';
const logo = require('../../../../../application/core/services/icon/images/click-to-pay.svg');

export class CTPSingInEmail {
  private errorFieldClass = 'st-hpp-prompt__field-error';
  private errorElement: HTMLElement;
  private fieldClass = 'st-hpp-prompt__field';
  private fieldElement: HTMLElement;
  private fieldErrorClass = 'st-hpp-prompt__field--invalid';
  private container: HTMLElement;

  constructor(private translator: ITranslator) {
  }
  setContainer(containerId: string){
    this.container = document.getElementById(containerId);
  }

  showError(errorText: string) {
    this.clearError();
    this.errorElement.innerText = errorText.trim();
    this.fieldElement.classList.add(this.fieldErrorClass);
  }

  private clearError() {
    this.errorElement.innerText = '';
    this.fieldElement.classList.remove(this.fieldErrorClass);
  }

  close(){
    this.container.innerHTML = '';
  }
  show(): Observable<string> {
    const fieldName = 'st-ctp-email';
    const formElement = document.createElement('form');
    const wrapperElement = document.createElement('div');

    formElement.innerHTML = `<div class="st-hpp-prompt__field-wrapper">
      <div class="st-ctp-prompt__header">
        <span class="st-ctp-prompt__logo"><img src="${logo}" class="st-ctp-prompt__logo-img" alt="">Click To Pay</span>
      </div>
    <span class="st-hpp-prompt__description">${this.translator.translate('Enter your email address to access your cards')}:</span>
    <label class="${this.fieldClass}">
      <span class="st-hpp-prompt__field-label">${this.translator.translate('Email address')}:</span>
      <input type="email" inputmode="email" name="${fieldName}" required class="st-hpp-prompt__field-input"/>
    </label>
    <span class="${this.errorFieldClass}"></span>
    <button type="submit" class="st-hpp-prompt__button">${this.translator.translate('Continue')}</button>
  </div>`;

    this.container.innerText = '';
    wrapperElement.classList.add('st-hpp-prompt');
    wrapperElement.appendChild(formElement);
    this.container.appendChild(wrapperElement);

    this.errorElement = formElement.querySelector(`.${this.errorFieldClass}`);
    this.fieldElement = formElement.querySelector(`.${this.fieldClass}`);

    formElement.querySelector(`[name="${fieldName}"]`).addEventListener('input', () => {
      this.clearError();
    });

    return fromEvent(formElement, 'submit').pipe(
      tap(event => {
        event.preventDefault();
        event.stopPropagation();
      }),
      filter(() => formElement.checkValidity()),
      map(() => formElement.elements[fieldName]?.value)
    );
  }
}
