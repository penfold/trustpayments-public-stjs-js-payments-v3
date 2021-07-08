import { Service } from 'typedi';
import { ValidationResult } from 'joi';
import { ConfigSchema } from '../storage/ConfigSchema';
import { IConfig } from '../../model/config/IConfig';

@Service()
export class ConfigValidator {
  validate(config: IConfig): ValidationResult {
    return ConfigSchema.validate(config);
  }
}
