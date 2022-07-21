import { Subject } from 'rxjs';
import { CTPSIgnInOTP } from '../CTPSingInOTP';
import { ITranslator } from '../../../../../../application/core/shared/translator/ITranslator';
import {
  IMastercardIdentityValidationChannel,
  IMastercardInitiateIdentityValidationResponse, MasterCardIdentityType,
} from '../../../../digital-terminal/src/mastercard/IMastercardSrc';

const logo = require('../../../../../../application/core/services/icon/images/click-to-pay.svg');

const header = (closeButtonId, logo) =>
  `<div class='st-ctp-prompt__header'>
    <img src='${logo}' class='st-ctp-prompt__logo--otp' alt=''>
    <span>Click To Pay</span>
    <span class='st-ctp-prompt__close st-ctp-prompt__close--otp' id='${closeButtonId}'>&times;</span>
   </div>`;

export class MastercardCTPSIgnInOTP extends CTPSIgnInOTP {
  wrapperForm: HTMLDivElement = document.createElement('div');
  validationCodeForm: HTMLFormElement = document.createElement('form');
  supportedValidationChannels: HTMLFormElement = document.createElement('form');
  private payAnotherWayCallback: (identityType : MasterCardIdentityType | string) => void;

  constructor(protected translator: ITranslator) {
    super(translator);
  }

  show(
    validationResponse: IMastercardInitiateIdentityValidationResponse,
    resultSubject: Subject<string>,
    resendSubject: Subject<boolean>
  ) {

    this.validationCodeForm.addEventListener('submit', event => {
      event.preventDefault();
      event.stopPropagation();

      if(this.validationCodeForm.checkValidity()) {
        const otpCode = this.otpInputsNames.map(name => this.validationCodeForm.elements[name]?.value).join('');
        resultSubject.next(otpCode);
      }
    });

    const validationChannels = (validationResponse.maskedValidationChannel as string).split(',');

    /* eslint-disable quotes*/
    this.validationCodeForm.innerHTML = `
      <div class='st-ctp-prompt__otp-wrapper'>
      ${header(this.closeButtonId, logo)}
      <div class='st-hpp-prompt__title'>${this.translator.translate('Looks like you have a Click to Pay profile')}</div>
      <div class='st-hpp-prompt__descrption'>${this.translator.translate('Enter the code sent to {{validationChannel}} ').replace('{{validationChannel}}', validationChannels.join(','))}
      </div>
      <div class='${this.fieldClass}'>
        ${this.otpInputsNames.map(value => `<input type='text' inputmode='numeric' required size='1' pattern='[0-9]{1}' name='${value}' class='st-ctp-prompt__otp-input' autocomplete='off' >`).join('')}
      <span class='${this.errorFieldClass} st-hpp-prompt__otp-input-error'></span>
      </div>
        <a class='st-hpp-prompt__link' id='st-ctp-prompt-continue-another-way' href='#'>${this.translator.translate('Continue another way')}</a>
        <button type='submit' class='st-hpp-prompt__button'>
          ${this.translator.translate('Continue')}
        </button>
     </div>`;
    /* eslint-enable quotes */

    this.validationCodeForm.querySelector(`#${this.closeButtonId}`).addEventListener('click', () => {
      if(this.cancelCallback) {
        this.cancelCallback();
      }
    });

    this.validationCodeForm.querySelector('#st-ctp-prompt-continue-another-way').addEventListener('click', () => {
      this.removeValidationCodeForm();
      this.showSupportedValidationChannels(validationResponse.supportedValidationChannels);
    });

    this.otpInputsNames.forEach(value => this.setInputListener(this.validationCodeForm.elements[value]));

    this.errorElement = this.validationCodeForm.querySelector(`.${this.errorFieldClass}`);
    this.fieldElement = this.validationCodeForm.querySelector(`.${this.fieldClass}`);

    this.container.innerHTML = '';
    this.wrapperForm.classList.add('st-hpp-prompt');
    this.wrapperForm.appendChild(this.validationCodeForm);
    this.container.appendChild(this.wrapperForm);
    (this.validationCodeForm.querySelector('input:first-of-type') as HTMLInputElement)?.focus();
  }

  showSupportedValidationChannels(supportedChannels: IMastercardIdentityValidationChannel[]) {

    this.supportedValidationChannels.innerHTML = `
     <div class='st-ctp-prompt__otp-wrapper'>
        ${header(this.closeButtonId, logo)}
        ${supportedChannels?.map((channel: IMastercardIdentityValidationChannel, index: number) => {
         return `<div><input type='radio' id='${channel.identityType}' name='channel' value='${channel.identityType}' ${!index ? 'checked' : ''}>
                      <label for='${channel.identityType}'>${channel.maskedValidationChannel}</label>
                 </div>`})}
        <div>
          <input type='radio' id='anotherWay' name='channel' value=''>
          <label for='anotherWay'>${this.translator.translate('Pay another way')}</label>
        </div>
        <button type='submit' class='st-hpp-prompt__button'>
          ${this.translator.translate('Continue')}
        </button>
     </div>`;
    this.wrapperForm.appendChild(this.supportedValidationChannels);

    this.supportedValidationChannels.querySelector(`#${this.closeButtonId}`).addEventListener('click', () => {
      if(this.cancelCallback) {
        this.cancelCallback();
      }
    });

    this.supportedValidationChannels.addEventListener('submit', event => {
      event.preventDefault();
      event.stopPropagation();

      if(this.supportedValidationChannels.elements['channel'].value === ''){
        this.close();
      }

      this.payAnotherWayCallback(this.supportedValidationChannels.elements['channel'].value)
    });
    }

   onPayAnotherWay(callback: any){
    this.payAnotherWayCallback = callback;
   }

  removeValidationCodeForm() {
    this.validationCodeForm.remove();
  }

}
