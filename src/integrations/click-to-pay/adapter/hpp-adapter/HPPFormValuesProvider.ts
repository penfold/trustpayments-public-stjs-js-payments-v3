import { Service } from 'typedi';
import { DomMethods } from '../../../../application/core/shared/dom-methods/DomMethods';
import { NewCardFieldName } from '../../card-list/NewCardFieldName';
import { HPPFormValues } from '../interfaces/HPPFormValues';
import { HPPFormFieldName } from './HPPFormFieldName';

@Service()
export class HPPFormValuesProvider {
  getFormValues(formElement: HTMLFormElement): HPPFormValues {
    const fieldNames = [...Object.values(HPPFormFieldName), ...Object.values(NewCardFieldName)];

    return fieldNames.reduce<HPPFormValues>((data: HPPFormValues, key: HPPFormFieldName | NewCardFieldName) => {
      data[key] = this.getFormFieldValue(key, formElement);

      return data;
    }, {} as HPPFormValues);
  }

  isRegisterCardEnabled(formElement: HTMLFormElement): boolean {
    return (formElement?.elements.namedItem(HPPFormFieldName.register) as HTMLInputElement)?.checked;
  }

  isCardListVisible(formElement: HTMLFormElement): boolean {
    return !!formElement.elements.namedItem(NewCardFieldName.pan);
  }

  private getFormFieldValue(fieldName: HPPFormFieldName | NewCardFieldName, formElement: HTMLFormElement): string {
    const element = formElement?.elements.namedItem(fieldName);

    if (!element) {
      return '';
    }

    if (DomMethods.isRadioNodeList(element)) {
      return element.value;
    }

    if (element.attributes.getNamedItem('type')?.value === 'radio') {
      return (element as HTMLInputElement).checked ? (element as HTMLInputElement).value : '';
    }

    return (element as HTMLInputElement).value || '';
  }

}

