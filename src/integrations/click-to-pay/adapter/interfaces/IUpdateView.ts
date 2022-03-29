export interface IUpdateView {
  displayCardForm: boolean;
  displaySubmitButton: boolean;
  submitButtonLabel?: { 
    pan: string | number, 
    name: string,
  } | boolean;
}
