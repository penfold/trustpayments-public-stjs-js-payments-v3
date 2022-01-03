import { Service } from 'typedi';
import { IStJwtPayload } from '../../../application/core/models/IStJwtPayload';
import { JwtDecoder } from '../jwt-decoder/JwtDecoder';

@Service()
export class PayloadSanitizer {
  constructor(private jwtDecoder: JwtDecoder) {}

  maskSensitiveJwtFields(currentJwt: string): IStJwtPayload {
    const maskedJwt = this.jwtDecoder.decode(currentJwt);
    const maskedFields = ['pan', 'expirydate', 'securitycode', 'credentialsonfile', 'fraudcontroltransactionid', 'billingprefixname', 'billingfirstname', 'billingmiddlename', 'billinglastname', 'billingsuffixname', 'billingpremise', 'billingstreet', 'billingtown', 'billingpostcode', 'billingcounty', 'billingemail', 'billingtelephone', 'customerprefixname', 'customerfirstname', 'customermiddlename', 'customerlastname', 'customersuffixname', 'customerpremise', 'customerstreet', 'customertown', 'customercounty', 'customerpostcode', 'customeremail', 'customertelephone', 'customfield1', 'customfield2', 'customfield3', 'customfield4', 'customfield5', 'operatorname'];

    Object.keys(maskedJwt.payload).forEach((key) => {
      if (maskedJwt.payload[key] !== undefined && maskedFields.includes(key)) {
        maskedJwt.payload[key] = '***';
      }
    });

    return maskedJwt;
  }
}