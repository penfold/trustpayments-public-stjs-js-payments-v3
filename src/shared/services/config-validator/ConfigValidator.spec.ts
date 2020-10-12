import { ConfigValidator } from './ConfigValidator';
import { IConfig } from '../../model/config/IConfig';
import { ValidationError } from 'joi';
import { ConfigSchema } from '../storage/ConfigSchema';
import { ConfigError } from './ConfigError';

jest.mock('./../storage/ConfigSchema');

describe('ConfigValidator', () => {
  let validator: ConfigValidator;
  const config: IConfig = ({
    jwt:
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhbTAzMTAuYXV0b2FwaSIsImlhdCI6MTYwMjQzMTUwMS4yODk1MDcyLCJwYXlsb2FkIjp7ImJhc2VhbW91bnQiOiIxMDAwIiwiYWNjb3VudHR5cGVkZXNjcmlwdGlvbiI6IkVDT00iLCJjdXJyZW5jeWlzbzNhIjoiR0JQIiwic2l0ZXJlZmVyZW5jZSI6InRlc3RfamFtZXMzODY0MSIsImxvY2FsZSI6ImVuX0dCIn19.OAYW2M9Pm-V4WEkPSzreOnX87L69Gq6UCqb-TCkr0cg',
    fieldsToSubmit: ['pan']
  } as unknown) as IConfig;

  beforeEach(() => {
    validator = new ConfigValidator();
    ConfigSchema.validate = jest.fn();
  });

  it('returns validation error if validation fails', () => {
    const error: ValidationError = ({ foo: 'bar' } as unknown) as ValidationError;

    (ConfigSchema.validate as jest.Mock).mockReturnValue({
      error,
      value: config
    });

    expect(validator.validate(config)).toBe(error);
  });

  it('returns null when validation suceeds', () => {
    (ConfigSchema.validate as jest.Mock).mockReturnValue({
      error: undefined,
      value: config
    });

    expect(validator.validate(config)).toBeNull();
  });

  it('does not call `ConfigSchema.validate` when pan value from fieldsToSubmit is not provided', () => {
    validator.validate({ ...config, fieldsToSubmit: [] });

    expect(ConfigSchema.validate).not.toHaveBeenCalled();
  });

  it('throws the custom error when pan value from fieldsToSubmit is not provided', () => {
    const errorText =
      'Configuration Error: You should provide pan / parenttransactionreference from jwt or define it in config as fieldsToSubmit';
    expect(validator.validate({ ...config, fieldsToSubmit: [] })).toEqual(new ConfigError(errorText));
  });
});
