import { Service } from 'typedi';
import { IStRequest } from '../../models/IStRequest';
import { COMMUNICATION_ERROR_INVALID_REQUEST } from '../../models/constants/Translations';
import packageInfo from '../../../../../package.json';
import { JwtDecoder } from '../../../../shared/services/jwt-decoder/JwtDecoder';
import { InvalidRequestError } from './InvalidRequestError';
import { IRequestObject } from '../../models/IRequestObject';
import { IStore } from '../../store/IStore';
import { IApplicationFrameState } from '../../store/state/IApplicationFrameState';

@Service()
export class RequestEncoderService {
  constructor(private jwtDecoder: JwtDecoder, private store: IStore<IApplicationFrameState>) {}

  encode(requestObject: IStRequest): IRequestObject {
    if (!Object.keys(requestObject).length) {
      throw new InvalidRequestError(COMMUNICATION_ERROR_INVALID_REQUEST);
    }

    return this.buildRequestObject(requestObject);
  }

  private buildRequestObject(requestData: IStRequest): IRequestObject {
    const ACCEPT_CONSUMER_OUTPUT = '2.00';
    const VERSION = '1.00';
    const VERSION_INFO = `STJS::N/A::${packageInfo.version}::N/A`;
    const jwt = this.store.getState().jwt;
    const jwtPayload = this.jwtDecoder.decode(jwt).payload;

    return {
      acceptcustomeroutput: ACCEPT_CONSUMER_OUTPUT,
      jwt,
      request: [
        {
          ...requestData,
          requestid: this.createRequestId(),
          sitereference: jwtPayload.sitereference,
        },
      ],
      version: VERSION,
      versioninfo: VERSION_INFO,
    };
  }

  private createRequestId(): string {
    return 'J-' + Math.random().toString(36).substring(2, 10);
  }
}
