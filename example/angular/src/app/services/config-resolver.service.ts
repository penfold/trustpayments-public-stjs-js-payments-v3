import { IPageOptions } from './page-options.interface';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { jwtgenerator } from '@trustpayments/jwt-generator';
import { environment } from '../../environments/environment';
import { map, switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ConfigResolver {
  constructor(private httpClient: HttpClient) {}

  resolve(configUrl: string, pageOptions: IPageOptions): Observable<any> {
    const config$ = pageOptions.inlineConfig
      ? of(pageOptions.inlineConfig)
      : this.httpClient.get(pageOptions.configUrl);

    return config$.pipe(
      map(config => ({
        ...config,
        formId: pageOptions.formId || config.formId,
        buttonId: pageOptions.submitButtonId || config.buttonId,
        submitCallback: pageOptions.submitCallback,
        errorCallback: pageOptions.errorCallback,
        successCallback: pageOptions.successCallback,
        cancelCallback: pageOptions.cancelCallback
      })),
      switchMap(config => {
        const jwt$ = pageOptions.jwt
          ? of(pageOptions.jwt)
          : this.httpClient
              .get(environment.jwtDataUrl)
              .pipe(map((response: any) => jwtgenerator(response.payload, response.secret, response.iss)));

        return jwt$.pipe(map(jwt => ({ ...config, jwt })));
      })
    );
  }
}
