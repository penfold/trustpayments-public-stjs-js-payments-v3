import { Injectable } from '@angular/core';
import { IPageOptions } from './page-options.interface';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PageOptionsResolver {
  private static readonly DEFAULT_FORM_ID = 'st-form';
  private static readonly DEFAULT_SUBMIT_BUTTON_ID = 'merchant-submit-button';
  private static readonly DEFAULT_ADDITIONAL_BUTTON_ID = 'additional-button';

  constructor(private route: ActivatedRoute) {}

  resolve(): IPageOptions {
    const params = this.route.snapshot.queryParamMap;
    return {
      configUrl: params.get('configUrl') || environment.configUrl,
      formId: params.get('formId') || PageOptionsResolver.DEFAULT_FORM_ID,
      submitButtonId: params.get('submitButtonId') || PageOptionsResolver.DEFAULT_SUBMIT_BUTTON_ID,
      noSubmitButton: this.parseBool(params.get('noSubmitButton')),
      additionalButton: this.parseBool(params.get('additionalButton')),
      additionalButtonId: params.get('additionalButtonId') || PageOptionsResolver.DEFAULT_ADDITIONAL_BUTTON_ID,
      jwt: params.get('jwt'),
      updatedJwt: params.get('updatedJwt'),
      submitCallback: this.parseCallback(params.get('submitCallback')),
      errorCallback: this.parseCallback(params.get('errorCallback')),
      successCallback: this.parseCallback(params.get('successCallback')),
      cancelCallback: this.parseCallback(params.get('cancelCallback')),
      inlineConfig: this.parseJson(params.get('inlineConfig'))
    };
  }

  private parseBool(value: string): boolean {
    return Boolean(value && JSON.parse(value));
  }

  private parseCallback(callbackFunction: string): ((data: any) => void) | null {
    if (!callbackFunction) {
      return null;
    }

    return (data: any) => eval(callbackFunction);
  }

  private parseJson(value: string): any | null {
    return (value && JSON.parse(value)) || null;
  }
}
