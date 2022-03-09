import { Token } from 'typedi';
import { ISrcProvider } from '../../integrations/click-to-pay/digital-terminal/ISrcProvider';

export const SrcProviderToken = new Token<ISrcProvider>('src-provider');
