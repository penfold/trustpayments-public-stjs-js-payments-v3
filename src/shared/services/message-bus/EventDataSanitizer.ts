import { Service } from 'typedi';

/*
 * This service removes any functions from the event data
 * as they cannot be serialized and sent between windows
 */
@Service()
export class EventDataSanitizer {
  sanitize(data: unknown): typeof data {
    if (!data) {
      return data;
    }

    if (typeof data === 'function') {
      return '[function]';
    }

    if (Array.isArray(data)) {
      return data.map(this.sanitize.bind(this));
    }

    if (typeof data === 'object') {
      return Object.entries(data).reduce((reduced, [key, value]) => {
        return { ...reduced, [key]: this.sanitize(value) };
      }, {});
    }

    return data;
  }
}
