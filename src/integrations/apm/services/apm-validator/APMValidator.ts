import { APMSchema, APMSchemasMap } from '../../models/APMSchema';
import { IAPMConfig } from '../../models/IAPMConfig';
import { Service } from 'typedi';
import { ValidationResult } from 'joi';
import { IAPMItemConfig } from '../../models/IAPMItemConfig';

@Service()
export class APMValidator {

  constructor() {}

  validate(config: IAPMConfig): ValidationResult {
    return APMSchema.validate(config);
  }

  validateAPMItemConfigs(apmList: Array<IAPMItemConfig>) {
    apmList.forEach((apm: IAPMItemConfig) => {
      if (APMSchemasMap.has(apm.name) && !APMSchemasMap.get(apm.name).validate(apm)) {
        return false;
      }
    });
    return true;
  }

}
