import { Service } from 'typedi';

@Service()
export class ErrorReconstructor {
  reconstruct(data: unknown): Error | unknown {
    if (!this.isErrorType(data)) {
      return data;
    }

    return Object.assign(new Error(), data);
  }

  private isErrorType(data: unknown): data is Error {
    if (!data || typeof data !== 'object') {
      return false;
    }

    const propertyNames = Object.getOwnPropertyNames(data);

    return propertyNames.includes('name') &&
      propertyNames.includes('message') &&
      propertyNames.includes('stack');
  }
}
