import { Service } from 'typedi';
import { MessageBus } from '../../application/core/shared/message-bus/MessageBus';
import { Validation } from '../../application/core/shared/validation/Validation';

@Service()
export class MerchantFields {
  private readonly inputs: HTMLCollection;
  constructor( private validation: Validation) {
    this.inputs = document.getElementsByTagName('input');
  }

  init(): void {
    this.setMerchantFieldsProperties();
  }

  private setMerchantFieldsProperties(): void {
    const { inputs } = this.getMerchantInputs();
    for (const item of inputs) {
      const { inputElement, messageElement } = Validation.returnInputAndErrorContainerPair(item);
      Validation.addErrorContainer(
        inputElement,
        'afterend',
        '<div class="st-error-label"></div>'
      );
      this.onKeyPress(inputElement);
      this.validation.backendValidation(inputElement, messageElement, MessageBus.EVENTS.VALIDATE_MERCHANT_FIELD);
    }
  }

  private getMerchantInputs(): { inputs: HTMLInputElement[] } {
    return {
      inputs: Array.from(this.inputs).filter(item =>
        item.hasAttribute('data-st-name')
      ) as HTMLInputElement[],
    };
  }

  private onKeyPress(input: HTMLInputElement): void {
    input.addEventListener('keypress', () => {
      Validation.resetValidationProperties(input);
    });
  }
}
