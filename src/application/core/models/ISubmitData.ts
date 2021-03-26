export interface ISubmitData {
  [index: string]: any;
  fieldsToSubmit?: string[];
  dataInJwt?: boolean;
  requestTypes?: string[];
}
