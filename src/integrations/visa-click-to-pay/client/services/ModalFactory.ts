import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { Service } from 'typedi';
import { IInitiateIdentityValidationResponse } from '../../../click-to-pay/digital-terminal/ISrc';

@Service()
export class ModalFactory {
  createEmailForm(result: any): HTMLFormElement {
    const fieldName = 'st-ctp-email';
    const formElement = document.createElement('form');
    formElement.addEventListener('submit', event => {
      event.preventDefault();
      event.stopPropagation();

      if (formElement.checkValidity()) {
        result.next(formElement.elements['st-ctp-email']?.value);
      } else {
        console.error('error');
      }
    });

    formElement.innerHTML = `<h2 class="st-modal__header">Sign in to Click to Pay</h2>
  <div class="st-form__field">
    <label for="st-form-price" class="st-form__label">
      Email address:
    </label>
    <input type="email" inputmode="email" name="${fieldName}" required class="st-form__input" />
  </div>
  <div class="st-form__group st-form__group--submit">
    <button type="submit" class="st-form__button">
      Continue
    </button>
  </div>`;

    return formElement;
  }

  createOTPForm(result: ReplaySubject<any>, validationResponse: IInitiateIdentityValidationResponse, resendSubject: BehaviorSubject<boolean>): HTMLFormElement {
    const fieldName = 'st-ctp-code';
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

    formElement.innerHTML = `
  <p class="st-modal__text">Enter the code sent to ${validationResponse.maskedValidationChannel}</p>
  <div class="number-inputs">
    <input type="text"  name="${fieldName}" class="st-form__input" autocomplete="off"/>
  </div>
  <div class="st-form__group st-form__group--submit">
    <a href="#" class="st-form__resend" id="st-ctp-opt-resend">Resend</a>
    <button type="submit" class="st-form__button">
      Continue
    </button>
  </div>`;

    formElement.querySelector('#st-ctp-opt-resend').addEventListener('click', event => {
      event.preventDefault();
      resendSubject.next(true);
    });

    return formElement;
  }

  createModalHeader(closeCallback): HTMLElement {
    const headerElement = document.createElement('div');
    headerElement.classList.add('st-modal__header');
    headerElement.innerHTML = `
      <p class="st-modal__text">Click to pay</p>
      <div id="st-modal__close-btn">&times;</div>
    `;
    headerElement.querySelector('#st-modal__close-btn').addEventListener('click', event => closeCallback(event));

    return headerElement;
  }
}
