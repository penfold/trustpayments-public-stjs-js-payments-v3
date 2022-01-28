const fs = require('fs');
const x = require('@trustpayments/jwt-generator');
const jsonConfig = require('./../src/library/config.json');

const jwtSecretKey = 'test';
const jwtIss = 'test';
const jwtDefaultPayload = {
  baseamount: '1000',
  accounttypedescription: 'ECOM',
  currencyiso3a: 'GBP',
  sitereference: 'test_jsmanualcardinal91921',
  requesttypedescriptions: ['THREEDQUERY']
};

jsonConfig.jwt = x.jwtgenerator(jwtDefaultPayload, jwtSecretKey, jwtIss);

fs.writeFile('./../src/library/config.json', JSON.stringify(jsonConfig), function writeJSON(err) {
  if (err) return console.log(err);
  console.log('New JWT key has been generated!');
});
