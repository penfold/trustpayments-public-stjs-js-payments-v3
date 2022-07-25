import 'url-polyfill';
import '../../styles/style.scss';
import './index.scss';
import * as Sentry from '@sentry/browser';
import { jwtgenerator } from '@trustpayments/jwt-generator';
import { EventHint, Event, BrowserClient } from '@sentry/browser';
import { BrowserTracing } from '@sentry/tracing';
import { Scope , Hub } from '@sentry/hub';

Sentry.init({
  dsn: 'https://bb4bf10cf3a945cd92ca330e448ac0fc@o1308742.ingest.sentry.io/6599336',
  integrations: [new BrowserTracing()],
  beforeSend: function(event: Event, hint?: EventHint) { console.log(event +  'beforesend'); return event},
  tracesSampleRate: 1.0,
});

// @ts-ignore
window.configJWT = (url: string) =>
  fetch(url)
    .then(response => response.json())
    .then(out => jwtgenerator(out.payload, out.secret, out.iss));

Sentry.configureScope((scope)=> {
  scope.setTag('my-tag', 'my value');
  scope.setUser({
    id: '42',
    email: 'john.doe@example.com',
  });
});

// @ts-ignore
const client: BrowserClient = new BrowserClient({
  dsn: 'https://213b24c3ce64455e8d8af140e35926d1@o1307800.ingest.sentry.io/6599426',
  integrations: [new BrowserTracing()],
  beforeSend: function(event: Event, hint?: EventHint) { console.log(event +  'beforesend'); return event},
  tracesSampleRate: 1.0,
})

const newHUB = new Hub(client)
// @ts-ignore
window.newHUB = newHUB;

newHUB.configureScope((scope:Scope)=>{
  scope.setTag('hostName', 'hub');
  scope.setTag('frameName', 'hub');
})

newHUB.run(currentHub => {
  currentHub.captureException(new Error('messag'));
});
