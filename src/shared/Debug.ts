import { environment } from '../environments/environment';

export class Debug {
  public static error(...data: unknown[]): void {
    if (!environment.production) {
      console.error(...data);
    }
  }

  public static warn(...data: unknown[]): void {
    if (!environment.production) {
      console.warn(...data);
    }
  }

  public static log(...data: unknown[]): void {
    if (!environment.production) {
      console.log(...data);
    }
  }
}
