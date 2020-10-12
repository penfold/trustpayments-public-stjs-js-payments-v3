import { Service } from 'typedi';
import { IConfig } from '../../model/config/IConfig';
import { ConfigSchema } from '../storage/ConfigSchema';
import JwtDecode from 'jwt-decode';
import { IDecodedJwt } from '../../../application/core/models/IDecodedJwt';
import { ConfigError } from './ConfigError';

@Service()
export class ConfigValidator {
  private _isEmptyPanField(config: IConfig): boolean {
    const { fieldsToSubmit, jwt } = config;
    const panAsField = fieldsToSubmit.find(field => field === 'pan');

    try {
      const decodedJwt = JwtDecode<IDecodedJwt>(jwt);
      const { pan, parenttransactionreference } = decodedJwt.payload;
      return !panAsField && !pan && !parenttransactionreference;
    } catch {
      return false;
    }
  }

  validate(config: IConfig): ConfigError | null {
    if (this._isEmptyPanField(config)) {
      const errorText =
        'Configuration Error: You should provide pan / parenttransactionreference from jwt or define it in config as fieldsToSubmit';
      return new ConfigError(errorText);
    }

    return ConfigSchema.validate(config).error || null;
  }
}
