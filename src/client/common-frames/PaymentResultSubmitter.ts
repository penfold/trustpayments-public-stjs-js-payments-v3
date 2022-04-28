import { Service } from 'typedi';
import { ConfigProvider } from '../../shared/services/config-provider/ConfigProvider';
import { DomMethods } from '../../application/core/shared/dom-methods/DomMethods';

type SubmitData = Record<string, string>;

@Service()
export class PaymentResultSubmitter {
  private static readonly REQUIRED_SUBMIT_FIELDS = ['jwt', 'threedresponse'];

  constructor(private configProvider: ConfigProvider) {}

  submitForm(data: SubmitData): void {
    this.prepareForm(data).submit();
  }

  prepareForm(data: SubmitData): HTMLFormElement {
    const config = this.configProvider.getConfig();
    const form = document.getElementById(data.formId || config.formId) as HTMLFormElement;
    const dataToSubmit: SubmitData = this.pickDataToSubmit(data, [
      ...PaymentResultSubmitter.REQUIRED_SUBMIT_FIELDS,
      ...config.submitFields,
    ]);

    DomMethods.removeAllCreatedFields(form);
    DomMethods.addDataToForm(form, dataToSubmit);

    return form;
  }

  private pickDataToSubmit(data: SubmitData, submitFields: string[]): SubmitData {
    return Object.entries(data)
      .filter(([key]) => submitFields.includes(key))
      .reduce((finalData: SubmitData, [key, value]) => ({ ...finalData, [key]: value }), {});
  }
}
