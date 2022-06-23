import 'location-origin';
import 'whatwg-fetch';
import 'reflect-metadata';
import 'core-js/es/array';
import 'core-js/es/object';
import 'core-js/es/function/name';
import 'core-js/es/map';
import 'core-js/web/url';
import 'core-js/web/url-search-params';
import 'fastestsmallesttextencoderdecoder';
import '@sheerun/mutationobserver-shim';
import 'element-remove';
import 'promise-polyfill/src/polyfill';
import 'symbol-observable';

// This is workaround for prevent errors from jose library in IE11
// it assumes that jose library is not used in IE11
// @ts-ignore
if (!window.crypto && window.msCrypto) {
  // @ts-ignore
  window['crypto'] = window.msCrypto;
}
