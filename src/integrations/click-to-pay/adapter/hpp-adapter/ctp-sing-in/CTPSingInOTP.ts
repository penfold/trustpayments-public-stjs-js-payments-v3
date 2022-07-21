import { Subject } from 'rxjs';
import { ITranslator } from '../../../../../application/core/shared/translator/ITranslator';
import { IInitiateIdentityValidationResponse } from '../../../digital-terminal/ISrc';
import { IMastercardInitiateIdentityValidationResponse } from '../../../digital-terminal/src/mastercard/IMastercardSrc';

export class CTPSIgnInOTP {
  protected readonly errorFieldClass = 'st-hpp-prompt__field-error';
  protected readonly fieldClass = 'st-ctp-prompt__otp-inputs';
  protected readonly fieldErrorClass = 'st-ctp-prompt__otp-inputs--invalid';
  protected readonly closeButtonId = 'st-hpp-prompt__otp-close';
  protected readonly fieldName = 'st-ctp-code';
  protected container: HTMLElement;
  protected fieldElement: HTMLElement;
  protected errorElement: HTMLElement;
  protected cancelCallback: () => void;
  protected otpInputsNames = new Array(6).fill('').map((value, index) => `${this.fieldName}${index}`);

  constructor(protected translator: ITranslator) {}

  setContainer(containerId: string) {
    this.container = document.getElementById(containerId);
  }

  showError(errorText: string) {
    this.clearError();
    this.errorElement.innerText = errorText.trim();
    this.fieldElement.classList.add(this.fieldErrorClass);
  }

  protected clearError() {
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
    validationResponse: IInitiateIdentityValidationResponse | IMastercardInitiateIdentityValidationResponse,
    resultSubject: Subject<string>,
    resendSubject: Subject<boolean>
  ) {}

  protected setInputListener(input: HTMLInputElement) {
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

  protected fillOTPInputs(code: string) {
    const splitCode = code.split('');
    this.otpInputsNames.forEach((fieldName, index) => {
      (this.container.querySelector(`form input[name="${fieldName}"]`) as HTMLInputElement).value = splitCode[index] || '';
    });
  }
}
