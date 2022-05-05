import { Subject } from 'rxjs';
import { ITranslator } from '../../../../../application/core/shared/translator/ITranslator';
import { IInitiateIdentityValidationResponse } from '../../../digital-terminal/ISrc';

const logo = require('../../../../../application/core/services/icon/images/click-to-pay.svg');
const visa = require('../../../../../application/core/services/icon/images/visa.svg');
const mastercard = require('../../../../../application/core/services/icon/images/mastercard.svg');
const amex = require('../../../../../application/core/services/icon/images/amex.svg');
const discover = require('../../../../../application/core/services/icon/images/discover.svg');

export class CTPSIgnInOTP {
  private readonly errorFieldClass = 'st-hpp-prompt__field-error';
  private readonly fieldClass = 'st-ctp-prompt__otp-inputs';
  private readonly fieldErrorClass = 'st-ctp-prompt__otp-inputs--invalid';
  private readonly closeButtonId = 'st-hpp-prompt__otp-close';
  private readonly fieldName = 'st-ctp-code';
  private container: HTMLElement;
  private fieldElement: HTMLElement;
  private errorElement: HTMLElement;
  private cancelCallback: () => void;
  private otpInputsNames = new Array(6).fill('').map((value, index) => `${this.fieldName}${index}`);

  constructor(private translator: ITranslator) {}

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

  onCancel(callback) {
    this.cancelCallback = callback;
  }

  show(
    validationResponse: IInitiateIdentityValidationResponse,
    resultSubject: Subject<string>,
    resendSubject: Subject<boolean>
  ) {
    const formElement = document.createElement('form');
    const wrapperElement = document.createElement('div');
    formElement.addEventListener('submit', event => {
      event.preventDefault();
      event.stopPropagation();

      if (formElement.checkValidity()) {
        const otpCode = this.otpInputsNames.map(name => formElement.elements[name]?.value).join('');
        resultSubject.next(otpCode);
      }
    });

    const validationChannels = (validationResponse.maskedValidationChannel as string).split(',');

    formElement.innerHTML = `
      <div class="st-ctp-prompt__otp-wrapper">
      <div class="st-ctp-prompt__header">
        <span class="st-ctp-prompt__logo">
          <img src="${logo}" class="st-ctp-prompt__logo-img" alt="">
          <img src="${visa}" class="st-ctp-prompt__logo-img" alt="">
          <img src="${mastercard}" class="st-ctp-prompt__logo-img" alt="">
          <img src="${amex}" class="st-ctp-prompt__logo-img" alt="" style='filter: invert(23%) sepia(61%) saturate(4974%) hue-rotate(195deg) brightness(97%) contrast(102%)'>
          <img src="${discover}" class="st-ctp-prompt__logo-img" alt="">
        </span>
        <span class="st-ctp-prompt__close" id="${this.closeButtonId}">&times;</span>
      </div>
      <div class="st-hpp-prompt__title">Confirm it's you</div>
      <div class="st-hpp-prompt__descrption">${this.translator.translate('Enter the one-time code Visa sent to')}<br/>
        ${validationChannels.length > 0 ? validationChannels[0].trim() : ''}
        ${validationChannels.length > 1? ', ' + validationChannels[1].trim() : ''}
        </div>
      <div class="${this.fieldClass}">
        ${this.otpInputsNames.map(value => `<input type="text" inputmode="numeric" required size="1" pattern="[0-9]{1}" name="${value}" class="st-ctp-prompt__otp-input" autocomplete="off" >`).join('')}
      <span class="${this.errorFieldClass} st-hpp-prompt__otp-input-error"></span>
      </div>
        <a href="#" class="st-hpp-prompt__link" id="st-ctp-opt-resend">${this.translator.translate('Resend')}</a>
        <button type="submit" class="st-hpp-prompt__button">
          ${this.translator.translate('Verify')}
        </button>
     </div>`;

    formElement.querySelector(`#${this.closeButtonId}`).addEventListener('click', () => {
      if (this.cancelCallback) {
        this.cancelCallback();
      }
    });

    formElement.querySelector('#st-ctp-opt-resend').addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      resendSubject.next(true);
    });

    this.otpInputsNames.forEach(value => this.setInputListener(formElement.elements[value]));

    this.errorElement = formElement.querySelector(`.${this.errorFieldClass}`);
    this.fieldElement = formElement.querySelector(`.${this.fieldClass}`);

    this.container.innerHTML = '';
    wrapperElement.classList.add('st-hpp-prompt');
    wrapperElement.appendChild(formElement);
    this.container.appendChild(wrapperElement);
    (formElement.querySelector('input:first-of-type') as HTMLInputElement)?.focus();
  }

  private setInputListener(input: HTMLInputElement) {
    input.addEventListener('beforeinput', event => {
      const digitsRegexp = /^\d+/g;
      if (event.data && !digitsRegexp.test(event.data)) {
        event.preventDefault();
        return;
      }

      if (input.value.length > 0) {
        input.select();
      }
    });

    input.addEventListener('input', event => {
      this.clearError();
      if (!input.value?.trim()) {
        return true;
      }

      (input.nextElementSibling as HTMLElement)?.focus();
    });

    input.addEventListener('keydown', event => {
      if (event.code === 'Backspace' && (event.target as HTMLInputElement).value === '') {
        (input.previousElementSibling as HTMLElement)?.focus();
      }
    });

    input.addEventListener('paste', event => {
      event.preventDefault();
      const pastedData = event.clipboardData?.getData('text/plain')?.trim();
      const isValidCode = typeof pastedData === 'string' && /^\d{6}$/.test(pastedData);

      if (isValidCode) {
        this.fillOTPInputs(pastedData);
      }
    });
  }

  private fillOTPInputs(code: string) {
    const splitCode = code.split('');
    this.otpInputsNames.forEach((fieldName, index) => {
      (this.container.querySelector(`form input[name="${fieldName}"]`) as HTMLInputElement).value = splitCode[index] || '';
    });
  }
}
