import { Service } from 'typedi';
import { Observable, of } from 'rxjs';
import { DomMethods } from '../../../application/core/shared/dom-methods/DomMethods';
import { IAPMItemConfig } from '../models/IAPMItemConfig';
import { IAPMConfig } from '../models/IAPMConfig';
import { APMConfigResolver } from '../services/apm-config-resolver/APMConfigResolver';

@Service()
export class APMClient {
  constructor(private apmUtils: APMConfigResolver) {
  }

  init(config: IAPMConfig): Observable<undefined> {
    this.apmUtils.resolve(config).apmList.forEach(itemConfig => this.insertAPMButton(itemConfig as IAPMItemConfig));

    return of(undefined);
  }

  private insertAPMButton(apmItemConfig: IAPMItemConfig) {
    DomMethods.appendChildStrictIntoDOM(apmItemConfig.placement, this.createButtonForApmItem(apmItemConfig));
  }

  private createButtonForApmItem(apmItemConfig: IAPMItemConfig): HTMLElement {
    const button = DomMethods.createHtmlElement({ type: 'button' }, 'button');
    button.addEventListener('click', (event) => this.onAPMButtonClick(event, apmItemConfig));

    return button;
  }

  private onAPMButtonClick(event: Event, { name }: IAPMItemConfig) {
    event.preventDefault();
    console.log(`${name} payment button clicked`); // TODO start payement here
  }
}
