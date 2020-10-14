import { Service } from 'typedi';
import { IConfig } from '../../model/config/IConfig';
import { ConfigSchema } from '../storage/ConfigSchema';
import JwtDecode from 'jwt-decode';
import { IDecodedJwt } from '../../../application/core/models/IDecodedJwt';
import { ConfigError } from './ConfigError';

@Service()
export class ConfigValidator {
  validate(config: IConfig): ConfigError | null {
    if (!this._hasPanField(config)) {
      const errorText =
        'Configuration Error: You should provide pan / parenttransactionreference from jwt or define it in config as fieldsToSubmit';
      return new ConfigError(errorText);
    }

    const schemaError = ConfigSchema.validate(config).error;

    return schemaError ? new ConfigError(schemaError.message) : null;
  }

  private _hasPanField(config: IConfig): boolean {
    const { fieldsToSubmit, jwt } = config;
    const panAsField = fieldsToSubmit.find(field => field === 'pan');

    const decodedJwt = JwtDecode<IDecodedJwt>(jwt);
    const { pan, parenttransactionreference } = decodedJwt.payload;
    return Boolean(panAsField || pan || parenttransactionreference);
  }
}
