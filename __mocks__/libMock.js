require('reflect-metadata');

const V = window.V;
global.V = V;

localStorage.merchantTranslations = '{"Some translation":"This is my translation"}';

global.MutationObserver = class {
  constructor(callback) {
  }

  disconnect() {
  }

  observe(element, initObject) {
  }

  takeRecords() {
    return [];
  }
};

// mocked due to https://github.com/jsdom/jsdom/issues/2600
global.RadioNodeList = class extends NodeList {
  get value() {
    return ''
  }
}

global.TextEncoder = function(...params) {
}

global.TextDecoder = function(...params) {
}
