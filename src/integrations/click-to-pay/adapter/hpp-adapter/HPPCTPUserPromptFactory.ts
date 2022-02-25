import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { Service } from 'typedi';
import { IInitiateIdentityValidationResponse } from '../../digital-terminal/ISrc';

@Service()
export class HPPCTPUserPromptFactory {
  createEmailForm(result: ReplaySubject<string>): HTMLFormElement {
    const fieldName = 'st-ctp-email';
    const formElement = document.createElement('form');
    const emailPattern = '[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'; // eslint-disable-line no-useless-escape
    formElement.addEventListener('submit', event => {
      event.preventDefault();
      event.stopPropagation();

      if (formElement.checkValidity()) {
        result.next(formElement.elements[fieldName]?.value);
      } else {
        console.error('error');
      }
    });

    formElement.innerHTML = `<h2 class="st-hpp-prompt__header">Sign in to Click to Pay</h2>
  <div class="st-form__field">
    <label for="st-form-price" class="st-form__label">
      Email address:
    </label>
    <input type="email" inputmode="email" pattern="${emailPattern}" name="${fieldName}" required class="st-form__input" />
  </div>
  <div class="st-form__group st-form__group--submit">
    <button type="submit" class="st-form__button">
      Continue
    </button>
  </div>`;

    return formElement;
  }

  createOTPForm(result: ReplaySubject<string>, validationResponse: IInitiateIdentityValidationResponse, resendSubject: BehaviorSubject<boolean>): HTMLFormElement {
    const otpCodePattern = '[0-9]{6}$';
    const fieldName = 'st-ctp-code';
    const formElement = document.createElement('form');
    formElement.addEventListener('submit', event => {
      event.preventDefault();
      event.stopPropagation();

      if (formElement.checkValidity()) {
        result.next(formElement.elements[fieldName]?.value);
      }
    });

    formElement.innerHTML = `
  <p class="st-hpp-prompt__text">Enter the code sent to ${validationResponse.maskedValidationChannel}</p>
  <div class="number-inputs">
    <input type="text"  inputmode="numeric" pattern="${otpCodePattern}" name="${fieldName}" class="st-form__input" autocomplete="off"/>
  </div>
  <div class="st-form__group st-form__group--submit">
    <a href="#" class="st-form__resend" id="st-ctp-opt-resend">Resend</a>
    <button type="submit" class="st-form__button">
      Continue
    </button>
  </div>`;

    formElement.querySelector('#st-ctp-opt-resend').addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      if (formElement.checkValidity()) {
        resendSubject.next(true);
      }
    });

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
}
