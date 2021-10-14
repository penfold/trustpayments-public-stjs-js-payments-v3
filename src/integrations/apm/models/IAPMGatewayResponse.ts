import { IRequestTypeResponse } from '../../../application/core/services/st-codec/interfaces/IRequestTypeResponse';

export interface IAPMGatewayResponse extends IRequestTypeResponse{
  redirecturl: string
}
