require('reflect-metadata');

const V = window.V;
global.V = V;

localStorage.merchantTranslations = '{"Some translation":"This is my translation"}';

global.MutationObserver = class {
  constructor(callback) {}
  disconnect() {}
  observe(element, initObject) {}
  takeRecords() {
    return [];
  }
};
