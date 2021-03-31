import { ConfigProvider } from '../../shared/services/config-provider/ConfigProvider';
import { IConfig } from '../../shared/model/config/IConfig';
import { DomMethods } from '../../application/core/shared/dom-methods/DomMethods';
import { Service } from 'typedi';

type SubmitData = Record<string, string>;

@Service()
export class PaymentResultSubmitter {
  private static readonly REQUIRED_SUBMIT_FIELDS = ['jwt', 'threedresponse'];

  constructor(private configProvider: ConfigProvider) {}

  submit(data: SubmitData): void {
    const config: IConfig = this.configProvider.getConfig();
    const form: HTMLFormElement = document.getElementById(config.formId) as HTMLFormElement;
    const dataToSubmit: SubmitData = this.pickDataToSubmit(data, [
      ...PaymentResultSubmitter.REQUIRED_SUBMIT_FIELDS,
      ...config.submitFields,
    ]);

    DomMethods.removeAllCreatedFields(form);
    DomMethods.addDataToForm(form, dataToSubmit);
    form.submit();
  }

  private pickDataToSubmit(data: SubmitData, submitFields: string[]): SubmitData {
    return Object.entries(data)
      .filter(([key]) => submitFields.includes(key))
      .reduce((finalData: SubmitData, [key, value]) => ({ ...finalData, [key]: value }), {});
  }
}
