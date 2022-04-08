const fs = require('fs');
const x = require('@trustpayments/jwt-generator');
const jsonConfig = require('./../src/library/config.json');

const jwtSecretKey = '58-bbe0c26553a301c75325e4be63cde49cc97024e0686de751b11957a5f7923b43';
const jwtIss = 'jsmanualjwt';

const jwtDefaultPayload = {
  billingstreet:"kensington avenue",
  billingpostcode: "PO1 3AX",
  billingcountryiso2a: "GB",
  baseamount: '1000',
  accounttypedescription: 'ECOM',
  currencyiso3a: 'GBP',
  sitereference: 'test_jsmanualtpthreeds91803',
  locale: "en_GB",
  requesttypedescriptions: [ "THREEDQUERY", "AUTH"]
};

jsonConfig.jwt = x.jwtgenerator(jwtDefaultPayload, jwtSecretKey, jwtIss);

module.exports = fs.writeFile('./../src/library/config.json', JSON.stringify(jsonConfig), function writeJSON(err) {
  if (err) return console.log(err);
  console.log('New JWT key has been generated!');
});
