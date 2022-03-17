import { Service } from 'typedi';
import { IUpdateView } from '../interfaces/IUpdateView';

@Service()
export class HPPUpdateViewCallback {
  private onUpdateViewCallback: (data: IUpdateView) => void;
  
  init(callback) {
    this.onUpdateViewCallback = callback;
  }
  
  callUpdateViewCallback(updateData: IUpdateView) {
    console.warn(updateData)
    this.onUpdateViewCallback?.call(null, updateData);
  }
}