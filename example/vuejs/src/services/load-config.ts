import environment from '@/environment/environment';
import axios, { AxiosResponse } from 'axios';
import IConfig from '@/interfaces/config';

export default function loadConfig(): Promise<IConfig> {
  return axios
    .get<any, AxiosResponse<IConfig>>(environment.configUrl)
    .then((response) => response.data);
}
