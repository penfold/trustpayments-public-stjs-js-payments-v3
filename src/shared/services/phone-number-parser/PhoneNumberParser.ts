import { Service } from 'typedi';
import parsePhoneNumber, { formatIncompletePhoneNumber } from 'libphonenumber-js/max';
import { IPhoneNumber } from '../../../integrations/click-to-pay/digital-terminal/ISrc';

@Service()
export class PhoneNumberParser {
  decodePhoneNumber(phoneNumber: string) {
    const normalizedAsInternationalNumber = `+${phoneNumber.trim()}`.replace('++', '+');
    const parsedNumber = parsePhoneNumber(normalizedAsInternationalNumber);
    let decodedNumber: IPhoneNumber;
    if (parsedNumber?.isValid()) {
      decodedNumber = {
        phoneNumber: parsedNumber.nationalNumber,
        countryCode: parsedNumber.countryCallingCode,
      };
    } else {
      decodedNumber = {
        phoneNumber: formatIncompletePhoneNumber(phoneNumber.trim()),
        countryCode: '',
      };
    }

    return decodedNumber;
  }
}
