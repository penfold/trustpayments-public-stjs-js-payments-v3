import { BehaviorSubject, Subject } from 'rxjs';
import { Service } from 'typedi';
import { IInitiateIdentityValidationResponse } from '../../digital-terminal/ISrc';
import './hpp-adapter.scss';
import { ITranslator } from '../../../../application/core/shared/translator/ITranslator';

@Service()
export class HPPCTPUserPromptFactory {
  constructor(private translator: ITranslator) {
  }

  createEmailForm(result: Subject<string>): HTMLFormElement {
    const fieldName = 'st-ctp-email';
    const formElement = document.createElement('form');
    formElement.addEventListener('submit', event => {
      event.preventDefault();
      event.stopPropagation();

      if (formElement.checkValidity()) {
        result.next(formElement.elements[fieldName]?.value);
      } else {
        console.error('error');
      }
    });

    formElement.innerHTML = `<div class="st-hpp-prompt__field-wrapper">
    <span class="st-hpp-prompt__description">${this.translator.translate('Enter your email address to access your cards')}:</span>
    <label class="st-hpp-prompt__field">
      <span class="st-hpp-prompt__field-label">${this.translator.translate('Email address')}:</span>
      <input type="email" inputmode="email" name="${fieldName}" required class="st-hpp-prompt__field-input"/>
    </label>
    <button type="submit" class="st-hpp-prompt__button">
      Continue
    </button>
  </div>`;

    return formElement;
  }

  createOTPForm(result: Subject<string>, validationResponse: IInitiateIdentityValidationResponse, resendSubject: BehaviorSubject<boolean>): HTMLFormElement {
    const fieldName = 'st-ctp-code';
    const formElement = document.createElement('form');
    const otpInputsNames = new Array(6).fill('').map((value, index) => `${fieldName}${index}`);
    formElement.addEventListener('submit', event => {
      event.preventDefault();
      event.stopPropagation();

      if (formElement.checkValidity()) {
        const otpCode = otpInputsNames.map(name => formElement.elements[name]?.value).join('');
        result.next(otpCode);
      }
    });

    formElement.innerHTML = `
  <div class="st-ctp-prompt__otp-wrapper">
  <div class="st-hpp-prompt__descrption">${this.translator.translate('Enter the code sent to ')}<br/>${(validationResponse.maskedValidationChannel as string)?.replace(',', '<br/>')}</div>
  <div class="st-ctp-prompt__otp-inputs">
    ${otpInputsNames.map(value => `<input type="text" inputmode="numeric" required size="1" pattern="[0-9]{1}" name="${value}" class="st-ctp-prompt__otp-input" autocomplete="off" >`).join('')}
  </div>
    <a href="#" class="st-hpp-prompt__link" id="st-ctp-opt-resend">${this.translator.translate('Resend')}</a>
    <button type="submit" class="st-hpp-prompt__button">
      Verify
    </button>
 </div>`;

    formElement.querySelector('#st-ctp-opt-resend').addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      if (formElement.checkValidity()) {
        resendSubject.next(true);
      }
    });

    otpInputsNames.forEach(value => this.setOTPInputListeners(formElement.elements[value]));

    return formElement;
  }

  createModalHeader(closeCallback): HTMLElement {
    const headerElement = document.createElement('div');
    headerElement.classList.add('st-hpp-prompt__header');
    headerElement.innerHTML = `
      <p class="st-hpp-prompt__text">Click to pay</p>
      <div id="st-hpp-prompt__close-btn">&times;</div>
    `;
    headerElement.querySelector('#st-hpp-prompt__close-btn').addEventListener('click', event => closeCallback(event));

    return headerElement;
  }

  private setOTPInputListeners(input: HTMLInputElement) {
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
