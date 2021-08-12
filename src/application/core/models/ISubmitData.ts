export interface ISubmitData {
  [index: string]: string[] | boolean;
  fieldsToSubmit?: string[];
  dataInJwt?: boolean;
  requestTypes?: string[];
}
