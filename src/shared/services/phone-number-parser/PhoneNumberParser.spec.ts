import { IPhoneNumber } from '../../../integrations/click-to-pay/digital-terminal/ISrc';
import { PhoneNumberParser } from './PhoneNumberParser';

describe('PhoneNumberParser', () => {
  let sut: PhoneNumberParser;

  beforeEach(() => {
    sut = new PhoneNumberParser();
  });

  describe('getCountryCallingCodeAndNationalNumber()', () => {
    it.each([
      ['48 555-555-555', {
        phoneNumber: '555555555',
        countryCode: '48',
      } as IPhoneNumber],
      ['44 20 8759 9036', {
        phoneNumber: '2087599036',
        countryCode: '44',
      }],
      ['+44 20 8759 9036', {
        phoneNumber: '2087599036',
        countryCode: '44',
      }],
      ['+1 213 621 0002', {
        phoneNumber: '2136210002',
        countryCode: '1',
      }],
    ])('if number (%s) is valid international number it should return object containing country calling code and national number (without spaces)', (input: string, expectedOutput: IPhoneNumber) => {
        expect(sut.decodePhoneNumber(input)).toEqual(expectedOutput);
      }
    );
  });

  it.each([
    ['555-555-555', {
      phoneNumber: '555555555',
      countryCode: '',
    } as IPhoneNumber],
    ['20 8759 9036', {
      phoneNumber: '2087599036',
      countryCode: '',
    }],
    ['20 8759 9036', {
      phoneNumber: '2087599036',
      countryCode: '',
    }],
    ['213 621 0002', {
      phoneNumber: '2136210002',
      countryCode: '',
    }],
    ['(89) 645 12 32', {
      phoneNumber: '896451232',
      countryCode: '',
    }],
  ])('if number (%s) is not international number or is invalid should return object containing empty country calling code and provided number as a national number (without formatting)', (input: string, expectedOutput: IPhoneNumber) => {
      expect(sut.decodePhoneNumber(input)).toEqual(expectedOutput);
    }
  );
});

