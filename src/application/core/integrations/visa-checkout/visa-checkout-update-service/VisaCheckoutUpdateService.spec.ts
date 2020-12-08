import { VisaCheckoutUpdateService } from './VisaCheckoutUpdateService';
import { IVisaCheckoutInitConfig } from '../IVisaCheckoutInitConfig';
import { IStJwtPayload } from '../../../models/IStJwtPayload';

describe('VisaCheckoutUpdateService', () => {
  let instance: VisaCheckoutUpdateService = new VisaCheckoutUpdateService();
  const stJwt: IStJwtPayload = {
    currencyiso3a: 'PLN',
    locale: 'pl_PL',
    mainamount: '100'
  };
  const config: IVisaCheckoutInitConfig = {
    apikey: 'some key',
    settings: {
      locale: 'en_GB'
    },
    paymentRequest: {
      currencyCode: 'GPB',
      total: '11',
      subtotal: '2'
    }
  };

  const updatedConfig: IVisaCheckoutInitConfig = {
    apikey: 'some key',
    settings: {
      locale: 'pl_PL'
    },
    paymentRequest: {
      currencyCode: 'PLN',
      total: '100',
      subtotal: '100'
    }
  };

  it('should set updated config with certain values', () => {
    expect(instance.updateVisaInit(stJwt, config)).toEqual(updatedConfig);
  });
});
