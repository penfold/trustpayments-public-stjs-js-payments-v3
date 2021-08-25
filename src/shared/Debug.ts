import { environment } from '../environments/environment';

export class Debug {
  static error(...data: unknown[]): void {
    if (!environment.production) {
      console.error(...data);
    }
  }

  static warn(...data: unknown[]): void {
    if (!environment.production) {
      console.warn(...data);
    }
  }

  static log(...data: unknown[]): void {
    if (!environment.production) {
      console.log(...data);
    }
  }
}
