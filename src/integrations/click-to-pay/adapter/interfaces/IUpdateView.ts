export interface IUpdateView {
  displayCardForm: boolean;
  displaySubmitForm: boolean;
  submitButtonLabel?: { 
    pan: string | number, 
    name: string,
  } | boolean;
}
