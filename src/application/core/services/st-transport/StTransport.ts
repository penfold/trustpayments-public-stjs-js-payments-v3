import JwtDecode from 'jwt-decode';
import { Utils } from '../../shared/utils/Utils';
import { StCodec } from '../st-codec/StCodec';
import { Service } from 'typedi';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { IConfig } from '../../../../shared/model/config/IConfig';
import { IStRequest } from '../../models/IStRequest';
import { environment } from '../../../../environments/environment';
import { IDecodedJwt } from '../../models/IDecodedJwt';
import { InvalidResponseError } from '../st-codec/InvalidResponseError';
import { JwtDecoder } from '../../../../shared/services/jwt-decoder/JwtDecoder';

interface IFetchOptions {
  headers: {
    Accept: string;
    'Content-Type': string;
    'ST-Request-Types'?: string;
  };
  method: string;
}

/**
 * Establishes connection with ST, defines client.
 * example usage:
 *   st.sendRequest({
 *     accounttypedescription: 'ECOM',
 *     expirydate: '01/20',
 *     pan: '4111111111111111',
 *     requesttypedescription: 'AUTH',
 *     securitycode: '123',
 *     sitereference: 'test_james38641'
 *   }).then();
 */
@Service()
export class StTransport {
  public static readonly THROTTLE_TIME = 250;
  private static DELAY = 1000;
  private static RETRY_LIMIT = 5;
  private static RETRY_TIMEOUT = 10000;
  private static TIMEOUT = 60000;
  private _throttlingRequests = new Map<string, Promise<object>>();
  private _config: IConfig;
  private _codec: StCodec;

  constructor(private configProvider: ConfigProvider, private jwtDecoder: JwtDecoder) {}

  /**
   * Perform a JSON API request with ST
   * @param requestObject A request object to send to ST
   * @return A Promise object that resolves the gateway response
   */
  public async sendRequest(requestObject: IStRequest): Promise<object> {
    const requestBody = this.getCodec().encode(requestObject);
    const fetchOptions = this._getDefaultFetchOptions(requestBody, requestObject.requesttypedescriptions);

    if (!this._throttlingRequests.has(requestBody)) {
      this._throttlingRequests.set(requestBody, this.sendRequestInternal(requestBody, fetchOptions));
      setTimeout(() => this._throttlingRequests.delete(requestBody), StTransport.THROTTLE_TIME);
    }

    return this._throttlingRequests.get(requestBody);
  }

  private _getDefaultFetchOptions(requestBody: string, requesttypedescriptions: string[]): IFetchOptions {
    const { jwt } = JSON.parse(requestBody);
    const options: IFetchOptions = {
      headers: {
        Accept: StCodec.CONTENT_TYPE,
        'Content-Type': StCodec.CONTENT_TYPE
      },
      method: 'post'
    };
    const hasRequestTypesToSkip =
      requesttypedescriptions &&
      requesttypedescriptions.some((req: string) => req === 'JSINIT' || req === 'WALLETVERIFY');

    if (environment.testEnvironment) {
      const decodedJwt = JwtDecode<IDecodedJwt>(jwt);
      const requestTypes = hasRequestTypesToSkip
        ? requesttypedescriptions.join(', ')
        : decodedJwt.payload.requesttypedescriptions.join(', ');

      options.headers = {
        ...options.headers,
        'ST-Request-Types': requestTypes
      };
    }

    return options;
  }

  private sendRequestInternal(requestBody: string, fetchOptions: IFetchOptions): Promise<object> {
    const codec = this.getCodec();
    const gatewayUrl = this.getConfig().datacenterurl;

    return this._fetchRetry(gatewayUrl, {
      ...fetchOptions,
      body: requestBody
    })
      .then(codec.decode)
      .catch((error: Error | unknown) => {
        if (error instanceof InvalidResponseError) {
          return Promise.reject(error);
        }

        return codec.decode({});
      });
  }

  /**
   * Fetch with timeout and retry
   * We probably want to update this to use an AbortControllor once this is standardised in the future
   * @param url The URL to be passed to the fetch request
   * @param options The options object to be passed to the fetch request
   * @param connectTimeout The time (ms) after which to time out
   * @param delay The delay for the retry
   * @param retries The number of retries
   * @param retryTimeout The longest amount of time to spend retrying
   * @return A Promise that resolves to a fetch response or rejects with an error
   * @private
   */
  private _fetchRetry(
    url: string,
    options: object,
    connectTimeout = StTransport.TIMEOUT,
    delay = StTransport.DELAY,
    retries = StTransport.RETRY_LIMIT,
    retryTimeout = StTransport.RETRY_TIMEOUT
  ) {
    return Utils.retryPromise(
      () => Utils.promiseWithTimeout<Response>(() => fetch(url, options), connectTimeout),
      delay,
      retries,
      retryTimeout
    );
  }

  private getConfig(): IConfig {
    if (!this._config) {
      this._config = this.configProvider.getConfig();
    }

    return this._config;
  }

  private getCodec(): StCodec {
    if (!this._codec) {
      const { jwt } = this.getConfig();
      this._codec = new StCodec(this.jwtDecoder, jwt);
    }

    return this._codec;
  }
}
