const headerContent = `
  <div class="header">
    <p class="st-modal__text">Click to pay</p>
  </div>
`;

const closeButton = `
  <div id="st-modal-close-btn" class="btn-close">
    x
  </div>
`;

const modalSignInEmailContent = `
  ${headerContent}
  ${closeButton}
  <h2 class="st-modal__header">Sign in to Click to Pay</h2>
  <div class="st-form__field">
    <label for="st-form-price" class="st-form__label">
      Email address:
    </label>
    <input type="text" class="st-form__input"/>
  </div>
  <div class="st-form__group st-form__group--submit">
    <button type="submit" class="st-form__button">
      Continue
    </button>
  </div>
`;

const modalSignInSmsContent = `
  ${headerContent}
  ${closeButton}
  <p class="st-modal__text"><strong>Hi Alex!</strong> For security, we need o confirm that this is you.</p>
  <p class="st-modal__text">Enter the code sent to +44 xxxxxx1234</p>
  <div class="number-inputs">
    <input type="text" class="st-form__input"/>
  </div>
  <div class="st-form__group st-form__group--submit">
    <a href="#" class="st-form__resend">Resend</a>
    <button type="submit" class="st-form__button">
      Continue
    </button>
  </div>
`;

export const modalSignInEmail: HTMLElement = document.createElement('div') as HTMLElement;
export const modalSignInSms: HTMLElement = document.createElement('div') as HTMLElement; 

modalSignInEmail.innerHTML = modalSignInEmailContent;
modalSignInSms.innerHTML = modalSignInSmsContent;
