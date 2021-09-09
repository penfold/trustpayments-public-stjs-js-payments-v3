import { Service } from 'typedi';

@Service()
export class Utils {
  inArray<T>(array: ArrayLike<T>, item: T): boolean {
    return Array.from(array).indexOf(item) >= 0;
  }

  promiseWithTimeout<T>(promissory: () => Promise<T>, timeout = 10, err = new Error()): Promise<T> {
    return Promise.race([promissory(), this.timeoutPromise(timeout, err)]);
  }

  retryPromise<T>(promissory: () => Promise<T>, delay = 0, retries = 5, retryTimeout = 100): Promise<T> {
    return new Promise((resolve, reject) => {
      const endtime = Date.now() + retryTimeout;
      let error: Error;

      function attempt() {
        if (retries > 0 && Date.now() < endtime) {
          promissory()
            .then(resolve)
            .catch(e => {
              retries--;
              error = e;
              setTimeout(() => attempt(), delay);
            });
        } else {
          reject(error);
        }
      }

      attempt();
    });
  }

  stripChars(string: string, regex?: RegExp | string): string {
    if (typeof regex === 'undefined' || !regex) {
      regex = /[\D+]/g;
      return string.replace(regex, '');
    } else {
      return string.replace(regex, '');
    }
  }

  getLastElementOfArray = (array: number[]): number => array && array.slice(-1).pop();

  setElementAttributes(attributes: Record<string, string | boolean>, element: HTMLInputElement): void {
    for (const attribute in attributes) {
      const value = attributes[attribute];
      if (this.inArray(['value'], attribute)) {
        // @ts-ignore
        element[attribute] = value;
      } else if (value === false) {
        element.removeAttribute(attribute);
      } else {
        element.setAttribute(attribute, value.toString());
      }
    }
  }

  private timeoutPromise(timeout: number, err = new Error()): Promise<never> {
    return new Promise((_, reject) => setTimeout(() => reject(err), timeout));
  }
}
