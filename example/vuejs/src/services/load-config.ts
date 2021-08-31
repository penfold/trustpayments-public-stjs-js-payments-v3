import axios from 'axios';
import { jwtgenerator } from '@trustpayments/jwt-generator';
import environment from '@/environment/environment';
import IConfig from '@/interfaces/config';

export default function loadConfig(): Promise<IConfig> {
  return axios
    .all([
      axios.get(environment.configUrl),
      axios.get(environment.jwtData),
    ])
    .then(axios.spread((...[configResponse, jwtDataResponse]) => {
      const { payload, secret, iss } = jwtDataResponse.data;
      const jwt = jwtgenerator(payload, secret, iss);

      return {
        ...configResponse.data,
        jwt,
      };
    }));
}
