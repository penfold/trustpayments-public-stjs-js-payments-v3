import { ErrorTypeName } from '../constants/ErrorTypeName';

export interface ExceptionString {
  pattern:  string,
  expected: boolean
}

export interface ExceptionFilter {
  environment?: ExceptionString[],
  errorTypeName?: ErrorTypeName,
  messageList?: RegExp[] | string[],
  fileNameList?: ExceptionString[],
  url?: ExceptionString,
  userId?: ExceptionString,
}

export interface ErrorFilter {
  id: number,
  description: string,
  filters: ExceptionFilter
}
