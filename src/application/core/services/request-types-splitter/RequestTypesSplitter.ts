import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { iinLookup } from '@securetrading/ts-iin-lookup';
import { Service } from 'typedi';

@Service()
export class RequestTypesSplitter {
  constructor(private _configProvider: ConfigProvider) {}

  private _isCardBypassed(pan: string): boolean {
    const bypassCards = this._configProvider.getConfig().bypassCards as string[];

    return bypassCards.includes(iinLookup.lookup(pan).type);
  }

  splitRequestTypes(requestTypes: string[], pan: string): [string[], string[]] {
    const threeDIndex = requestTypes.indexOf('THREEDQUERY');

    if (threeDIndex === -1) {
      const filterThreeDQuery = (requestType: string) => !this._isCardBypassed(pan) || requestType !== 'THREEDQUERY';
      return [[], [...requestTypes].filter(filterThreeDQuery)];
    }

    return [requestTypes.slice(0, threeDIndex + 1), requestTypes.slice(threeDIndex + 1, requestTypes.length)];
  }
}
