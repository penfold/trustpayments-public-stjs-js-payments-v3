export interface IPageOptions {
  configUrl: string;
  formId: string;
  submitButtonId: string;
  noSubmitButton: boolean;
  additionalButton: boolean;
  additionalButtonId?: string;
  jwt?: string;
  updatedJwt?: string;
  submitCallback?: (data: any) => void;
  errorCallback?: (data: any) => void;
  successCallback?: (data: any) => void;
  cancelCallback?: (data: any) => void;
  inlineConfig?: any;
}
