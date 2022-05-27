import 'url-polyfill';
import '../../styles/style.scss';
import './ctp.scss';

import { jwtgenerator } from '@trustpayments/jwt-generator';

// @ts-ignore
window.configJWT = (url: string) =>
  fetch(url)
    .then(response => response.json())
    .then(out => jwtgenerator(out.payload, out.secret, out.iss));
