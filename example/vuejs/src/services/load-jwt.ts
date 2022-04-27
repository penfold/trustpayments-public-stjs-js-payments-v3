import axios from 'axios';
import { jwtgenerator } from '@trustpayments/jwt-generator';

export default function loadJwt(fileName): Promise<any> {
  return axios.get(`/json/${fileName}`)
    .then((jwtDataResponse) => {
      const { payload, secret, iss } = jwtDataResponse.data;
      const jwt = jwtgenerator(payload, secret, iss);
      return jwt;
    });
}
