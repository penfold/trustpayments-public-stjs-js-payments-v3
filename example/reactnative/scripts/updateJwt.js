const fs = require('fs');
const x = require('@trustpayments/jwt-generator');
const jsonConfig = require('./../src/library/config.json');

const jwtSecretKey = 'ja<n}yP]3$1E$iUYtn_*i7))24I,=^';
const jwtIss = 'am0310.autoapi';
const jwtDefaultPayload = {
  baseamount: '1000',
  accounttypedescription: 'ECOM',
  currencyiso3a: 'GBP',
  sitereference: 'test_james38641',
  requesttypedescriptions: ['THREEDQUERY']
};

jsonConfig.jwt = x.jwtgenerator(jwtDefaultPayload, jwtSecretKey, jwtIss);

fs.writeFile('./../src/library/config.json', JSON.stringify(jsonConfig), function writeJSON(err) {
  if (err) return console.log(err);
  console.log('New JWT key has been generated!');
});
