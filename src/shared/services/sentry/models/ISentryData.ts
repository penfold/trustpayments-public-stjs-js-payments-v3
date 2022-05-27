export enum SentryDataFields {
  CurrentRequestId = 'currentRequestId',
  CurrentResponseId = 'currentResponseId'
}

export type ISentryData = Record<SentryDataFields,string>;

export interface ISentryMessageEvent {
  name: SentryDataFields,
  value: string
}
