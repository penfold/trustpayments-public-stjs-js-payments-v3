import environment from '@/environment/environment';
import IConfig from '@/interfaces/config';

type SecureTradingFactory = (config: IConfig) => any;

let secureTradingFactory: SecureTradingFactory;

declare const SecureTrading: SecureTradingFactory;

export default function loadLibrary(): Promise<SecureTradingFactory> {
  if (secureTradingFactory) {
    return Promise.resolve(secureTradingFactory);
  }

  return new Promise((resolve) => {
    const script = document.createElement('script');
    const onLoadHandler = () => {
      secureTradingFactory = SecureTrading;
      resolve(secureTradingFactory);
      script.removeEventListener('load', onLoadHandler);
    };

    script.type = 'text/javascript';
    script.src = environment.libraryUrl;
    script.addEventListener('load', onLoadHandler);

    document.body.appendChild(script);
  });
}
