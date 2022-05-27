import { forkJoin, from, Observable, switchMap } from 'rxjs';
import { map, mapTo, tap } from 'rxjs/operators';
import { InjectMany, Service } from 'typedi';
import { SrcProviderToken } from '../../../client/dependency-injection/InjectionTokens';
import {
  ICheckoutData,
  ICheckoutResponse,
  ICompleteIdValidationResponse,
  IConsumerIdentity,
  IIdentityLookupResponse,
  IInitiateIdentityValidationResponse,
  IIsRecognizedResponse,
  ISrc,
  ISrcInitData,
} from './ISrc';
import { SrcName } from './SrcName';
import { ISrcProvider } from './ISrcProvider';
import { IIdentityLookupResult } from './interfaces/IIdentityLookupResult';
import { IAggregatedProfiles } from './interfaces/IAggregatedProfiles';
import { CardAggregator } from './CardAggregator';

@Service()
export class SrcAggregate {
  private srcs: Map<SrcName, Observable<ISrc>> = new Map();

  constructor(
    @InjectMany(SrcProviderToken) private srcProviders: ISrcProvider[],
    private cardAggregator: CardAggregator,
  ) {
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

  getSrcProfile(idTokens: string[]): Observable<IAggregatedProfiles> {
    return this.forkJoinSrcs(src => src.getSrcProfile(idTokens)).pipe(
      map(result => ({
        srcProfiles: result,
        aggregatedCards: this.cardAggregator.aggregate(result),
      })),
    );
  }

  identityLookup(consumerIdentity: IConsumerIdentity): Observable<IIdentityLookupResult> {
    const reductorFunc = (acc: IIdentityLookupResult, next: [SrcName, IIdentityLookupResponse]): IIdentityLookupResult => {
      const [srcName, { consumerPresent }] = next;
      return {
        consumerPresent: acc.consumerPresent || consumerPresent,
        srcNames: consumerPresent ? [...acc.srcNames, srcName] : acc.srcNames,
      };
    };

    return this.forkJoinSrcs(src => src.identityLookup(consumerIdentity)).pipe(
      tap(v => console.log('IDENTITY LOOKUP', v)),
      map(result => Object.entries(result).reduce(reductorFunc, { consumerPresent: false, srcNames: [] })),
    );
  }

  initiateIdentityValidation(srcName: SrcName): Observable<IInitiateIdentityValidationResponse> {
    return this.srcs.get(srcName).pipe(
      switchMap(src => from(src.initiateIdentityValidation())),
    );
  }

  completeIdentityValidation(srcName: SrcName, validationData: string): Observable<ICompleteIdValidationResponse> {
    return this.srcs.get(srcName).pipe(
      switchMap(src => from(src.completeIdentityValidation(validationData))),
    );
  }

  checkout(srcName: SrcName, data: ICheckoutData): Observable<ICheckoutResponse> {
    return this.srcs.get(srcName).pipe(
      switchMap(src => from(src.checkout(data))),
    );
  }

  unbindAppInstance(): Observable<undefined> {
    return this.forkJoinSrcs(src => src.unbindAppInstance()).pipe(mapTo(undefined));
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
