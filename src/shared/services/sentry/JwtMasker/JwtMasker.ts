import 'url-search-params-polyfill';
import { QueryParams } from '@sentry/types';
import { Service } from 'typedi';

@Service()
export class JwtMasker {

  mask<T extends QueryParams>(queryParams: T): T {
    if (typeof queryParams === 'string') {
      return queryParams.replace(/(^|\?|&)jwt=.*?(&|$)/, '$1jwt=*****$2') as T;
    }

    if (Array.isArray(queryParams)) {
      queryParams.map((item: string[], index: number) => {
        if (item[0] === 'jwt') {
          queryParams[index][1] = '*****';

          return queryParams;
        }
      });
    }

    if (this.isObject(queryParams) && Object.keys(queryParams).includes('jwt')) {
      Object.keys(queryParams).map((item: string) => {
        if (item === 'jwt') {
          queryParams[item] = '*****';

          return queryParams;
        }
      });
    }

    return queryParams;
  }

  private isObject(val: unknown): boolean {
    return val && typeof val === 'object';
  }
}
