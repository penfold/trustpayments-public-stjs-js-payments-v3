import { IPageOptions } from './page-options.interface';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ConfigResolver {
  constructor(private httpClient: HttpClient) {}

  resolve(configUrl: string, pageOptions: IPageOptions): Observable<any> {
    const config$: Observable<any> = pageOptions.inlineConfig
      ? of(pageOptions.inlineConfig)
      : this.httpClient.get(pageOptions.configUrl);

    return config$.pipe(
      map(config => ({
        ...config,
        jwt: pageOptions.jwt || config.jwt,
        formId: pageOptions.formId || config.formId,
        buttonId: pageOptions.submitButtonId || config.buttonId,
        submitCallback: pageOptions.submitCallback,
        errorCallback: pageOptions.errorCallback,
        successCallback: pageOptions.successCallback,
        cancelCallback: pageOptions.cancelCallback
      }))
    );
  }
}
