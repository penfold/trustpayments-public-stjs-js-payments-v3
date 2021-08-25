import { Container } from 'typedi';
import { MessageBus } from '../../application/core/shared/message-bus/MessageBus';
import { Validation } from '../../application/core/shared/validation/Validation';
import { Frame } from '../../application/core/shared/frame/Frame';
import { IMessageBus } from '../../application/core/shared/message-bus/IMessageBus';
import { MessageBusToken } from '../../shared/dependency-injection/InjectionTokens';

export class MerchantFields {
  private static readonly ADJACENT_HTML_PLACEMENT: InsertPosition = 'afterend';
  private static readonly DATA_ATTRIBUTE_NAME: string = 'data-st-name';
  private static readonly ERROR_LABEL_MARKUP: string = '<div class="st-error-label"></div>';
  private static readonly INPUT_MARKUP: string = 'input';
  private static readonly KEYPRESS_EVENT: string = 'keypress';

  private readonly inputs: HTMLCollection;
  private messageBus: IMessageBus;
  private validation: Validation;
  private frame: Frame;

  constructor() {
    this.inputs = document.getElementsByTagName(MerchantFields.INPUT_MARKUP);
    this.messageBus = Container.get(MessageBusToken);
    this.frame = Container.get(Frame);
    this.validation = new Validation();
  }

  public init(): void {
    this.setMerchantFieldsProperties();
  }

  private setMerchantFieldsProperties(): void {
    const { inputs } = this.getMerchantInputs();
    for (const item of inputs) {
      const { inputElement, messageElement } = Validation.returnInputAndErrorContainerPair(item);
      Validation.addErrorContainer(
        inputElement,
        MerchantFields.ADJACENT_HTML_PLACEMENT,
        MerchantFields.ERROR_LABEL_MARKUP
      );
      this.onKeyPress(inputElement);
      this.validation.backendValidation(inputElement, messageElement, MessageBus.EVENTS.VALIDATE_MERCHANT_FIELD);
    }
  }

  private getMerchantInputs(): { inputs: HTMLInputElement[] } {
    return {
      inputs: Array.from(this.inputs).filter(item =>
        item.hasAttribute(MerchantFields.DATA_ATTRIBUTE_NAME)
      ) as HTMLInputElement[],
    };
  }

  private onKeyPress(input: HTMLInputElement): void {
    input.addEventListener(MerchantFields.KEYPRESS_EVENT, () => {
      Validation.resetValidationProperties(input);
    });
  }
}
