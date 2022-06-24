import { Event } from '@sentry/types';
import { Service } from 'typedi';
import { Exception, StackFrame } from '@sentry/browser';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { SENTRY_EVENT_FILTERING_CONFIG } from './SentryEventFilteringConfig';
import { ErrorFilter, ExceptionString } from './SentryEventFiltering.model';

@Service()
export class SentryEventFilteringService {
  sentryFilteringConfig: ErrorFilter[] = SENTRY_EVENT_FILTERING_CONFIG;

  filterEvent<T extends { event: Event, error: Error }>() {
    return (source: Observable<T>): Observable<T> => source.pipe(filter(value => {
     return !this.verifyEvent(value?.event, value?.error)
    }));
  }

  private verifyEvent( event: Event, error: Error): boolean {
    if(!event){
       return true;
     }

    return this.sentryFilteringConfig.map((errorFilter: ErrorFilter) => {
      return (this.isInstanceOf(errorFilter?.filters?.errorTypeName, error) &&
        this.includeEnvironment(errorFilter?.filters?.environment, event) &&
        this.hasUserId(errorFilter?.filters?.userId, event) &&
        this.includeUrl(errorFilter?.filters?.url, event) &&
        this.hasMessage(errorFilter?.filters?.messageList, event) &&
        this.hasFileName(errorFilter?.filters?.fileNameList, event));
    }).some((value: boolean) => {
      return value === true
    } );

  }

  private hasUserId(userId: ExceptionString, event: Event): boolean {
    if(!userId?.pattern || !event?.user?.id) {
      return true;
    }

    return new RegExp(`^${userId?.pattern}`).test(event.user.id) === userId.expected;
  }

  private includeUrl(url: ExceptionString, event: Event): boolean {
    if(!url?.pattern || !event?.request?.url) {
      return true;
    }

    return event.request.url.includes(url?.pattern) === url.expected;
  }

  private isInstanceOf(errorTypeName: string, error: Error) : boolean{
    if(!errorTypeName) {
      return true;
    }

    if(errorTypeName === 'TimeoutError') {
      return error?.constructor?.name === errorTypeName || error?.constructor?.name === 'TimeoutErrorImpl';
    }

    return error?.constructor?.name === errorTypeName;
  }

  private hasFileName(fileNameList: ExceptionString[], event: Event): boolean {
    if(!fileNameList?.length) {
      return true;
    }

    let stackFrameList: StackFrame[] = [];
    event?.exception?.values.forEach((value: Exception) => {
      stackFrameList = [...stackFrameList, ...value.stacktrace.frames];
    });

    return fileNameList.some((fileName: ExceptionString) => {
      return stackFrameList.some((frame: StackFrame) => {
        return (new RegExp(`/${fileName.pattern}$`).test(frame.filename) === fileName.expected);
      });
    });

  }

  private includeEnvironment(environmentList: ExceptionString[], event: Event): boolean {
    if(!environmentList?.length) {
      return true;
    }

    return environmentList.some((environment: ExceptionString) => {
      return (environment.pattern === event?.environment) === environment.expected;
    });
  }

  private hasMessage(messageList: string[] | RegExp[], event: Event): boolean {
    if(!messageList?.length) {
      return true;
    }

    return event?.exception?.values.some((exception: Exception) => {
      return messageList.some((message: string | RegExp) => new RegExp(message).test(exception?.value));
    });
  }
}
