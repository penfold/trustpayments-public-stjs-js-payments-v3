import { forkJoin, from, Observable, switchMap } from 'rxjs';
import { map, mapTo, tap } from 'rxjs/operators';
import { Service } from 'typedi';
import { ISrcInitData, IIsRecognizedResponse, ISrc } from './ISrc';
import { VisaSrcProvider } from './src/VisaSrcProvider';
import { SrcName } from './SrcName';
import { ISrcProvider } from './ISrcProvider';

@Service()
export class SrcAggregate {
  private srcProviders: ISrcProvider[];
  private srcs: Map<SrcName, Observable<ISrc>> = new Map();

  constructor(private visaSrcProvider: VisaSrcProvider) {
    this.srcProviders = [
      visaSrcProvider,
    ];
  }

  init(initData: ISrcInitData): Observable<void> {
    this.srcProviders.forEach(srcProvider => {
      this.srcs.set(srcProvider.getSrcName(), srcProvider.getSrc());
    });

    return this.forkJoinSrcs(src => src.init(initData)).pipe(
      tap(v => console.log('INIT', v)),
      mapTo(undefined),
    );
  }

  isRecognized(): Observable<IIsRecognizedResponse> {
    return this.forkJoinSrcs(src => src.isRecognized()).pipe(
      tap(v => console.log('IS RECOGNIZED', v)),
      map(result => Object.values(result).reduce((acc, next) => ({
        recognized: acc.recognized || next.recognized,
        idTokens: [...acc.idTokens, ...(next.idTokens || [])],
      }), { recognized: false, idTokens: [] })),
    )
  }

  private forkJoinSrcs<T>(callback: (src: ISrc) => Promise<T>): Observable<Partial<Record<SrcName, T>>> {
    const sources: Partial<Record<SrcName, Observable<T>>> = {};

    this.srcs.forEach((src$, srcName) => {
      sources[srcName] = src$.pipe(
        switchMap(src => from(callback(src))),
      );
    });

    return forkJoin(sources);
  }
}
