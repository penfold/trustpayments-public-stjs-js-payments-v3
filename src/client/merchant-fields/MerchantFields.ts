import { Container, Service } from 'typedi';
import { MessageBus } from '../../application/core/shared/message-bus/MessageBus';
import { Validation } from '../../application/core/shared/validation/Validation';
import { Frame } from '../../application/core/shared/frame/Frame';
import { IMessageBus } from '../../application/core/shared/message-bus/IMessageBus';
import { MessageBusToken } from '../../shared/dependency-injection/InjectionTokens';

@Service()
export class MerchantFields {
  private readonly inputs: HTMLCollection;
  private messageBus: IMessageBus;
  private frame: Frame;

  constructor(private validation: Validation) {
    this.inputs = document.getElementsByTagName('input');
    this.messageBus = Container.get(MessageBusToken);
    this.frame = Container.get(Frame);
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
