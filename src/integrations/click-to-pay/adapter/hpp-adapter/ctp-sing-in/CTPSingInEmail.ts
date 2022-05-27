import { fromEvent, Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { ITranslator } from '../../../../../application/core/shared/translator/ITranslator';

// @ts-ignore
import logo from '../../../../../application/core/services/icon/images/click-to-pay.svg';

export class CTPSingInEmail {
  private errorFieldClass = 'st-hpp-prompt__field-error';
  private errorElement: HTMLElement;
  private fieldClass = 'st-hpp-prompt__field';
  private fieldElement: HTMLElement;
  private fieldErrorClass = 'st-hpp-prompt__field--invalid';
  private container: HTMLElement;
  private closeButtonId = 'st-hpp-prompt__close';

  constructor(private translator: ITranslator) {
  }

  setContainer(containerId: string) {
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

  close() {
    this.container.innerHTML = '';
  }

  show(): Observable<string> {
    const fieldName = 'st-ctp-email';
    const formElement = document.createElement('form');
    const wrapperElement = document.createElement('div');

    formElement.innerHTML = `<div class="st-hpp-prompt__field-wrapper">
      <div class="st-ctp-prompt__header">
        <span class="st-ctp-prompt__logo"><img src="${logo}" class="st-ctp-prompt__logo-img" alt="">
        <span>Click To Pay</span>
        <span class="st-ctp-prompt__tooltip-trigger" id="st-ctp-prompt-click-to-pay"><i class="fal fa-info-circle"></i></span>
      </div>
    <span class="st-ctp-prompt__close" id="${this.closeButtonId}">&times;</span>
    <span class="st-hpp-prompt__description">${this.translator.translate('Enter your email address to access your cards')}</span>
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

    const tooltip = document.createElement('div');
    tooltip.innerHTML = this.createTooltip();
    document.querySelector('.st-ctp-prompt__header').appendChild(tooltip);

    this.errorElement = formElement.querySelector(`.${this.errorFieldClass}`);
    this.fieldElement = formElement.querySelector(`.${this.fieldClass}`);

    formElement.querySelector(`[name="${fieldName}"]`).addEventListener('input', () => {
      this.clearError();
    });

    document.getElementById('st-ctp-prompt-click-to-pay').addEventListener('click', () => {
      this.showTooltip();
    });
    document.getElementById('st-tooltip__close-button').addEventListener('click', () => {
      this.hideTooltip();
    });

    document.getElementById(this.closeButtonId).addEventListener('click', () => this.close());

    return fromEvent(formElement, 'submit').pipe(
      tap(event => {
        event.preventDefault();
        event.stopPropagation();
      }),
      filter(() => formElement.checkValidity()),
      map(() => formElement.elements[fieldName]?.value)
    );
  }

  private createTooltip(): string {
    return `
    <div class="st-tooltip" id="st-tooltip">
      <div style="justify-content: flex-end">
        <span class="st-tooltip__close-button" id="st-tooltip__close-button">&times;</span>
      </div>
      <div style="justify-content: center">
        <div>
          <span class="st-ctp-welcome__logo"><img src="${logo}" alt=""></span><span>Click to Pay</span>
        </div>
      </div>
      <div style="font-size: 12px; font-weight: bold; justify-content: center; margin-bottom: 12px">${this.translator.translate('Pay with confidence with trusted brands')}</div>
      <div class="st-tooltip__content">
        <div>${this.translator.translate('For an easy and smart checkout, simply click to pay whenever you see the Click to Pay icon {{clickToPayLogo}}, and your card is accepted.').replace('{{clickToPayLogo}}',`<img class="st-tooltip__logo" src="${logo}" alt="">`)}</div>
        <div>${this.translator.translate('You can choose to be remembered on your device and browser for faster checkout.')}</div>
        <div>${this.translator.translate('Built on industry standards for online transactions and supported by global payment brands.')}</div>
      </div>
    </div>
    `;
  }

  private hideTooltip(): void {
    document.getElementById('st-tooltip').classList.remove('st-tooltip--visible');
  }

  private showTooltip(): void {
    document.getElementById('st-tooltip').classList.add('st-tooltip--visible');
  }

}
