import { Subject } from 'rxjs';
import { ITranslator } from '../../../../../application/core/shared/translator/ITranslator';
import { IInitiateIdentityValidationResponse } from '../../../digital-terminal/ISrc';

export class CTPSIgnInOTP {
  private errorFieldClass = 'st-hpp-prompt__field-error';
  private errorElement: HTMLElement;
  private fieldClass = 'st-ctp-prompt__otp-inputs';
  private fieldElement: HTMLElement;
  private fieldErrorClass = 'st-ctp-prompt__otp-inputs--invalid';
  private container: HTMLElement;
  private closeButtonId = 'st-hpp-prompt__otp-close';
  private cancelCallback: () => void;

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

  onCancel(callback) {
    this.cancelCallback = callback;
  }

  show(validationResponse: IInitiateIdentityValidationResponse, resultSubject: Subject<string>, resendSubject: Subject<boolean>) {
    const fieldName = 'st-ctp-code';
    const formElement = document.createElement('form');
    const otpInputsNames = new Array(6).fill('').map((value, index) => `${fieldName}${index}`);
    const wrapperElement = document.createElement('div');
    formElement.addEventListener('submit', event => {
      event.preventDefault();
      event.stopPropagation();

      if (formElement.checkValidity()) {
        const otpCode = otpInputsNames.map(name => formElement.elements[name]?.value).join('');
        resultSubject.next(otpCode);
      }
    });

    formElement.innerHTML = `
      <div class="st-ctp-prompt__otp-wrapper">
      <div class="st-ctp-prompt__otp-header">
        <img src="" class="st-ctp-promp__otp-logo" alt="">
        <span class="st-ctp-promp__otp-close" id="${this.closeButtonId}">&times;</span>
      </div>
      <div class="st-hpp-prompt__title">Confirm it is you.</div>
      <div class="st-hpp-prompt__descrption">${this.translator.translate('Enter the code sent to ')}<br/>${(validationResponse.maskedValidationChannel as string)?.replace(',', '<br/>')}</div>
      <div class="${this.fieldClass}">
        ${otpInputsNames.map(value => `<input type="text" inputmode="numeric" required size="1" pattern="[0-9]{1}" name="${value}" class="st-ctp-prompt__otp-input" autocomplete="off" >`).join('')}
      </div>
      <span class="${this.errorFieldClass}"></span>
        <a href="#" class="st-hpp-prompt__link" id="st-ctp-opt-resend">${this.translator.translate('Resend')}</a>
        <button type="submit" class="st-hpp-prompt__button">
          Verify
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

    otpInputsNames.forEach(value => this.setInputListener(formElement.elements[value]));

    this.errorElement = formElement.querySelector(`.${this.errorFieldClass}`);
    this.fieldElement = formElement.querySelector(`.${this.fieldClass}`);

    this.container.innerHTML = '';
    wrapperElement.classList.add('st-hpp-prompt');
    wrapperElement.appendChild(formElement);
    this.container.appendChild(wrapperElement);
    // return fromEvent(formElement, 'submit').pipe(
    //   tap(event => {
    //     event.preventDefault();
    //     event.stopPropagation();
    //   }),
    //   filter(() => formElement.checkValidity()),
    //   map(() => otpInputsNames.map(name => formElement.elements[name]?.value).join(''))
    // );
  }

  private setInputListener(input: HTMLInputElement) {
    input.addEventListener('beforeinput', event => {
      if (input.value.length > 0) {
        input.select();
      }
    });

    input.addEventListener('input', event => {
      if (!input.value?.trim()) {
        return true;
      }

      (input.nextElementSibling as HTMLElement)?.focus();
    });
  }
}
