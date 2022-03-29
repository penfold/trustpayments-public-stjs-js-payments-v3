export interface IUpdateView {
  displayCardForm?: boolean;
  displaySubmitForm?: boolean;
  submitButtonLabel?: { 
    pan: number, 
    name: string,
  } | boolean;
}
