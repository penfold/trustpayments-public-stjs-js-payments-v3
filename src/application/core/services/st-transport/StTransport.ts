import JwtDecode from 'jwt-decode';
import { Service } from 'typedi';
import { Utils } from '../../shared/utils/Utils';
import { StCodec } from '../st-codec/StCodec';
import { ConfigProvider } from '../../../../shared/services/config-provider/ConfigProvider';
import { IConfig } from '../../../../shared/model/config/IConfig';
import { IStRequest } from '../../models/IStRequest';
import { environment } from '../../../../environments/environment';
import { IDecodedJwt } from '../../models/IDecodedJwt';
import { InvalidResponseError } from '../st-codec/InvalidResponseError';
import { JwtDecoder } from '../../../../shared/services/jwt-decoder/JwtDecoder';
import { RequestTimeoutError } from '../../../../shared/services/sentry/RequestTimeoutError';
import { SentryService } from '../../../../shared/services/sentry/SentryService';

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
  static readonly THROTTLE_TIME = 250;
  private static DELAY = 1000;
  private static RETRY_LIMIT = 5;
  private static RETRY_TIMEOUT = 10000;
  private static TIMEOUT = 60000;
  private throttlingRequests = new Map<string, Promise<Record<string, unknown>>>();
  private config: IConfig;
  private codec: StCodec;

  constructor(private configProvider: ConfigProvider, private jwtDecoder: JwtDecoder, private sentryService: SentryService) {}

  /**
   * Perform a JSON API request with ST
   * @param requestObject A request object to send to ST
   * @return A Promise object that resolves the gateway response
   */
  async sendRequest(requestObject: IStRequest, merchantUrl?: string): Promise<Record<string, unknown>> {
    const requestBody = this.getCodec().encode(requestObject);
    const fetchOptions = this.getDefaultFetchOptions(requestBody, requestObject.requesttypedescriptions);

    if (!this.throttlingRequests.has(requestBody)) {
      this.throttlingRequests.set(requestBody, this.sendRequestInternal(requestBody, fetchOptions, merchantUrl));
      setTimeout(() => this.throttlingRequests.delete(requestBody), StTransport.THROTTLE_TIME);
    }

    return this.throttlingRequests.get(requestBody);
  }

  private getDefaultFetchOptions(requestBody: string, requesttypedescriptions: string[]): IFetchOptions {
    const { jwt } = JSON.parse(requestBody);
    const options: IFetchOptions = {
      headers: {
        Accept: StCodec.CONTENT_TYPE,
        'Content-Type': StCodec.CONTENT_TYPE,
      },
      method: 'post',
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
        'ST-Request-Types': requestTypes,
      };
    }

    return options;
  }

  private sendRequestInternal(requestBody: string, fetchOptions: IFetchOptions, merchantUrl?: string): Promise<Record<string, unknown>> {
    const codec = this.getCodec();
    const gatewayUrl = merchantUrl ? merchantUrl : this.getConfig().datacenterurl;

    return this.fetchRetry(gatewayUrl, {
      ...fetchOptions,
      body: requestBody,
    })
      .then(response => codec.decode(response, JSON.parse(requestBody)))
      .catch((error: Error | unknown) => {
        this.sentryService.sendCustomMessage(new RequestTimeoutError('Request timeout', new Error('timeout')));

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
  private fetchRetry(
    url: string,
    options: Record<string, unknown>,
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
    if (!this.config) {
      this.config = this.configProvider.getConfig();
    }

    return this.config;
  }

  private getCodec(): StCodec {
    if (!this.codec) {
      const { jwt } = this.getConfig();
      this.codec = new StCodec(this.jwtDecoder, jwt);
    }

    return this.codec;
  }
}
