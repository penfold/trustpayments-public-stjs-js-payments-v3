import { Store } from './Store';
import { IApplicationFrameState } from '../state/IApplicationFrameState';
import { IMessageBus } from '../../shared/message-bus/IMessageBus';
import { Inject, Service } from 'typedi';
import { WINDOW } from '../../../../shared/dependency-injection/InjectionTokens';
import { BehaviorSubject } from 'rxjs';
import IControlFrameWindow from '../../../../shared/interfaces/IControlFrameWindow';

@Service()
export class ControlFrameStore extends Store<IApplicationFrameState> {
  static readonly INITIAL_STATE: IApplicationFrameState = {
    storage: {},
    jwt:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1NjExMTUyMDksInNpdGVyZWZlcmVuY2UiOiJsaXZlMiIsInBheWxvYWQiOnsicmVxdWVzdHJlZmVyZW5jZSI6IlczMy0wcm0wZ2N5eCIsInJlc3BvbnNlIjpbeyJhY2NvdW50dHlwZWRlc2NyaXB0aW9uIjoiRUNPTSIsImFjcXVpcmVycmVzcG9uc2Vjb2RlIjoiMDAiLCJhdXRoY29kZSI6IlRFU1Q1NiIsImJhc2VhbW91bnQiOiIxMDAiLCJjdXJyZW5jeWlzbzNhIjoiR0JQIiwiZGNjZW5hYmxlZCI6IjAiLCJlcnJvcmNvZGUiOiIwIiwiZXJyb3JtZXNzYWdlIjoiT2siLCJpc3N1ZXIiOiJTZWN1cmVUcmFkaW5nIFRlc3QgSXNzdWVyMSIsImlzc3VlcmNvdW50cnlpc28yYSI6IlVTIiwibGl2ZXN0YXR1cyI6IjAiLCJtYXNrZWRwYW4iOiI0MTExMTEjIyMjIyMwMjExIiwibWVyY2hhbnRjb3VudHJ5aXNvMmEiOiJHQiIsIm1lcmNoYW50bmFtZSI6IndlYnNlcnZpY2UgVU5JQ09ERSBtZXJjaGFudG5hbWUiLCJtZXJjaGFudG51bWJlciI6IjAwMDAwMDAwIiwib3BlcmF0b3JuYW1lIjoid2Vic2VydmljZXNAc2VjdXJldHJhZGluZy5jb20iLCJvcmRlcnJlZmVyZW5jZSI6IkFVVEhfVklTQV9QT1NULVBBU1MtSlNPTi1KU09OIiwicGF5bWVudHR5cGVkZXNjcmlwdGlvbiI6IlZJU0EiLCJyZXF1ZXN0dHlwZWRlc2NyaXB0aW9uIjoiQVVUSCIsInNlY3VyaXR5cmVzcG9uc2VhZGRyZXNzIjoiMiIsInNlY3VyaXR5cmVzcG9uc2Vwb3N0Y29kZSI6IjIiLCJzZWN1cml0eXJlc3BvbnNlc2VjdXJpdHljb2RlIjoiMiIsInNldHRsZWR1ZWRhdGUiOiIyMDE5LTAyLTIxIiwic2V0dGxlc3RhdHVzIjoiMCIsInNwbGl0ZmluYWxudW1iZXIiOiIxIiwidGlkIjoiMjc4ODI3ODgiLCJ0cmFuc2FjdGlvbnJlZmVyZW5jZSI6IjMzLTktODAxNjgiLCJ0cmFuc2FjdGlvbnN0YXJ0ZWR0aW1lc3RhbXAiOiIyMDE5LTAyLTIxIDEwOjA2OjM1In1dLCJzZWNyYW5kIjoiWktBVk1za1dRIiwidmVyc2lvbiI6IjEuMDAifX0.aCx7MASC9Qz-lfmHB8zMHuB8imNPFiGJGfgLtqNSHmE',
  };

  constructor(messageBus: IMessageBus, @Inject(WINDOW) private window: IControlFrameWindow) {
    super(new BehaviorSubject<IApplicationFrameState>(ControlFrameStore.INITIAL_STATE), messageBus);
    this.window.stStore = this.state$;
  }
}
