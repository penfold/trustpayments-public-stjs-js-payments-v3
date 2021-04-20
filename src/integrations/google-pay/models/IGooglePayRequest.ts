import { PaymentStatus } from "../../../application/core/services/payments/PaymentStatus";
import { RequestType } from "../../../shared/types/RequestType";

export interface IGooglePayGatewayRequest {
    [key: string]: any;
    requestTypes: RequestType[];
    resultStatus?: PaymentStatus
    walletsource?: string
    wallettoken?: string
}