import { Service } from 'typedi';
import { Utils } from '../utils/Utils';
import { Validation } from '../validation/Validation';
import { ValidationFactory } from '../validation/ValidationFactory';

@Service()
export class Formatter {
  private blocks: number[] = [2, 2];
  private cardNumberFormatted: string;
  private dateBlocks = {
    currentDateMonth: '',
    currentDateYear: '',
    previousDateYear: '',
  };
  private validation: Validation;

  constructor(private validationFactory: ValidationFactory) {
    this.validation =  this.validationFactory.create();
  }

  number(cardNumber: string, id: string): { formatted: string, nonformatted: string } {
    this.validation.cardNumber(cardNumber);
    const element: HTMLInputElement = document.getElementById(id) as HTMLInputElement;
    const cardNumberCleaned: string = this.validation.removeNonDigits(this.validation.cardNumberValue);
    element.value = cardNumberCleaned;
    const cardDetails = this.validation.getCardDetails(cardNumberCleaned);
    const format = cardDetails ? cardDetails.format : '(\\d{1,4})(\\d{1,4})?(\\d{1,4})?(\\d+)?';
    const previousValue = cardNumberCleaned;
    let value = previousValue;
    let selectEnd = element.selectionEnd;
    let selectStart = element.selectionStart;
    if (format && value.length > 0) {
      value = Utils.stripChars(value, undefined);
      let matches = value.match(new RegExp(format, '')).slice(1);
      if (Utils.inArray(matches, undefined)) {
        matches = matches.slice(0, matches.indexOf(undefined));
      }
      const matched = matches.length;
      if (format && matched > 1) {
        const preMatched = previousValue.split(' ').length;
        selectStart += matched - preMatched;
        selectEnd += matched - preMatched;
        value = matches.join(' ');
      }
    }

    if (value !== previousValue) {
      Utils.setElementAttributes({ value }, element);
      element.setSelectionRange(selectStart, selectEnd);
    }
    this.cardNumberFormatted = value ? value : '';
    if (value) {
      this.validation.cardNumberValue = value.replace(/\s/g, '');
    }
    return { formatted: this.cardNumberFormatted, nonformatted: this.validation.cardNumberValue };
  }

  date(value: string, id?: string): string {
    this.validation.expirationDate(value);
    const element: HTMLInputElement = document.getElementById(id) as HTMLInputElement;
    let result = '';

    this.blocks.forEach(length => {
      if (this.validation.expirationDateValue && this.validation.expirationDateValue.length > 0) {
        const sub = this.validation.expirationDateValue.slice(0, length);
        const rest = this.validation.expirationDateValue.slice(length);
        result += sub;
        this.validation.expirationDateValue = rest;
      }
    });
    let fixedDate = this.dateFixed(result);
    element.value = fixedDate;
    fixedDate = fixedDate ? fixedDate : '';
    return fixedDate;
  }

  code(value: string, length: number, id?: string): string {
    this.validation.securityCode(value, length);
    const element: HTMLInputElement = document.getElementById(id) as HTMLInputElement;
    element.value = this.validation.securityCodeValue ? this.validation.securityCodeValue : '';
    return this.validation.securityCodeValue;
  }

  private dateISO(previousDate: string[], currentDate: string[]) {
    this.dateBlocks.currentDateMonth = currentDate[0];
    this.dateBlocks.currentDateYear = currentDate[1];
    this.dateBlocks.previousDateYear = previousDate[1];

    if (!this.dateBlocks.currentDateMonth.length) {
      return '';
    } else if (this.dateBlocks.currentDateMonth.length && this.dateBlocks.currentDateYear.length === 0) {
      return this.dateBlocks.currentDateMonth;
    } else if (
      this.dateBlocks.currentDateMonth.length === 2 &&
      this.dateBlocks.currentDateYear.length === 1 &&
      this.dateBlocks.previousDateYear.length === 0
    ) {
      return this.dateBlocks.currentDateMonth + '/' + this.dateBlocks.currentDateYear;
    } else if (
      (this.dateBlocks.currentDateMonth.length === 2 &&
        this.dateBlocks.currentDateYear.length === 1 &&
        (this.dateBlocks.previousDateYear.length === 1 || this.dateBlocks.previousDateYear.length === 2)) ||
      (this.dateBlocks.currentDateMonth.length === 2 && this.dateBlocks.currentDateYear.length === 2)
    ) {
      return this.dateBlocks.currentDateMonth + '/' + this.dateBlocks.currentDateYear;
    }
  }

  private dateFixed(value: string) {
    const month: string = value.slice(0, 2);
    const year: string = value.slice(2, 4);
    const date: string[] = [month, year];
    return this.dateISO(['', ''], date);
  }
}
