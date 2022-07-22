import {  defer, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

export const logTimer =
  <T = any>(nameOfFn) =>
  (source: Observable<T>) =>
    defer(() => {
    console.time('Time Function Measure ' + nameOfFn);
      return source;
    }).pipe(
      finalize(() => {
        console.timeEnd('Time Function Measure ' + nameOfFn )
      })
    );
