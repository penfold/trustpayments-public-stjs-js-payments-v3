import { from, Observable } from 'rxjs';
import { Service } from 'typedi';
import { IScriptParams } from '../../models/IScriptParams';
import { DomMethods } from '../../shared/dom-methods/DomMethods';

@Service()
export class VisaCheckoutScriptInjector {
  public injectScript(placement: string, params: IScriptParams): Observable<Element> {
    return from(DomMethods.insertScript(placement, params));
  }
}
