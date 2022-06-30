export class Utils {
  static inArray<T>(array: ArrayLike<T>, item: T): boolean {
    return Array.from(array).indexOf(item) >= 0;
  }

  static forEachBreak<inputType, returnType>(
    iterable: ArrayLike<inputType>,
    callback: (item: inputType) => returnType
  ): returnType {
    let result: returnType = null;
    for (const i in iterable) {
      result = callback(iterable[i]);
      if (result) {
        break;
      }
    }
    return result || null;
  }

  static timeoutPromise(timeout: number, err = new Error('Request timeout')): Promise<never> {
    return new Promise((_, reject) => setTimeout(() => reject(err), timeout));
  }

  static promiseWithTimeout<T>(promissory: () => Promise<T>, timeout = 10): Promise<T> {
    return Promise.race([promissory(), Utils.timeoutPromise(timeout)]);
  }

  static retryPromise<T>(promissory: () => Promise<T>, delay = 0, retries = 5, retryTimeout = 100): Promise<T> {
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

  static stripChars(string: string, regex?: RegExp | string): string {
    if (typeof regex === 'undefined' || !regex) {
      regex = /[\D+]/g;
      return string.replace(regex, '');
    } else {
      return string.replace(regex, '');
    }
  }

  static getLastElementOfArray = (array: number[]): number => array && array.slice(-1).pop();

  static setElementAttributes(attributes: Record<string, string | boolean>, element: HTMLInputElement): void {
    for (const attribute in attributes) {
      const value = attributes[attribute];
      if (Utils.inArray(['value'], attribute)) {
        // @ts-ignore
        element[attribute] = value;
      } else if (value === false) {
        element.removeAttribute(attribute);
      } else {
        element.setAttribute(attribute, value.toString());
      }
    }
  }
}
