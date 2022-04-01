import { Service } from 'typedi';
import { Observable, Subject } from 'rxjs';
import { IUpdateView } from '../interfaces/IUpdateView';

@Service()
export class HPPUpdateViewCallback {
  private updateViewState: Subject<IUpdateView> = new Subject();
  onUpdateViewCallback: (data: IUpdateView) => void;

  init(callback) {
    this.onUpdateViewCallback = callback;
  }

  callUpdateViewCallback(updateData: IUpdateView) {
    this.onUpdateViewCallback?.call(null, updateData);
    this.updateViewState.next(updateData);
  }

  getUpdateViewState(): Observable<IUpdateView> {
    return this.updateViewState.asObservable();
  }
}
