import * as jose from 'node-jose';

const KID = 'A5CHRN38V3PJ90ACENUH13CCVOyXIL7A8rC9xClvyZyxvMgrE';
const PUBLIC_KEY = `
-----BEGIN CERTIFICATE-----
MIIFDzCCA/egAwIBAgIUGia+bgG/HZCJvOJ2CDGqqMIyuQswDQYJKoZIhvcNAQEL
BQAwfTELMAkGA1UEBhMCVVMxDTALBgNVBAoTBFZJU0ExLzAtBgNVBAsTJlZpc2Eg
SW50ZXJuYXRpb25hbCBTZXJ2aWNlIEFzc29jaWF0aW9uMS4wLAYDVQQDEyVWaXNh
IEluZm9ybWF0aW9uIERlbGl2ZXJ5IEV4dGVybmFsIENBMB4XDTIwMTAwNzA4MDAx
MVoXDTIzMDEwNTA4MDAxMVowgYkxFDASBgNVBAcMC0Zvc3RlciBDaXR5MQswCQYD
VQQIDAJDQTELMAkGA1UEBhMCVVMxETAPBgNVBAoMCFZpc2EgSW5jMRgwFgYDVQQL
DA9PdXRib3VuZCBDbGllbnQxKjAoBgNVBAMMIWVuYy0xYmRhYjNjYy5zYnguZGln
aXRhbC52aXNhLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALGT
yLrA3+8kJ54QZFPZrteFTjtwq7ot2+6wH9imHqG1EZlwNe29SV/Y4NAnfr4KZrsk
68QVEnPuG9PlD4EsBhaj1lKcdPBMaq8DwzrxaIwaLtsJcqvG3MtFLPgX3gs0hOZT
FXUl01113Darvqm9towggiQC6cbAK7G6DDl7C3nYdzOFzUOVxgLUX+2/vrk2OQ6/
Si2MlL2SgJ2NODCiTxDueGIiBTOQ0wITTprNPPY3THcflESCiYz1NvkaRxtbvCwh
tNvEUyKT7DW0Wp7kuUwGP85cQ4G9YSid+mG2RDRy4PT10wYXTjJVPdA0y5X3Gy02
vg+w4JYwGlgrr8yz2hsCAwEAAaOCAXgwggF0MAwGA1UdEwEB/wQCMAAwHwYDVR0j
BBgwFoAUGTpSZs0pH+P6yzR9FnYhAtpPuRgwZQYIKwYBBQUHAQEEWTBXMC4GCCsG
AQUFBzAChiJodHRwOi8vZW5yb2xsLnZpc2FjYS5jb20vdmljYTMuY2VyMCUGCCsG
AQUFBzABhhlodHRwOi8vb2NzcC52aXNhLmNvbS9vY3NwMDkGA1UdIAQyMDAwLgYF
Z4EDAgEwJTAjBggrBgEFBQcCARYXaHR0cDovL3d3dy52aXNhLmNvbS9wa2kwEwYD
VR0lBAwwCgYIKwYBBQUHAwIwXQYDVR0fBFYwVDAooCagJIYiaHR0cDovL0Vucm9s
bC52aXNhY2EuY29tL1ZJQ0EzLmNybDAooCagJIYiaHR0cDovL2NybC5pbm92LnZp
c2EubmV0L1ZJQ0EzLmNybDAdBgNVHQ4EFgQUNW/PkNTl6yw+1mthz/0FKsN8zjgw
DgYDVR0PAQH/BAQDAgeAMA0GCSqGSIb3DQEBCwUAA4IBAQAv4hzfp2+dkMFfpP8s
KWPrXzzMWuo+rXtjijrqgE2cPQO5wNo8639eCyvc7hH45qUV85AlfDp1T6QjL3ih
zywoooa0Tm1htJLPOGhSmaCO3NE4VMzeZkruVoG9rLAu9Vk4MygcDljL/EbMAYKE
K7YI0hP19HYD7M9NhXhvwE6LnyrITKPNrntnzn1Ave8lE7vJ1hTF68f8jOVmVvtp
rfGQ+gM8Et4pc1zoi4Jmz5J1YOSOY8KdgYtl0QTE6vyVNo8zkzggUqb0vqd4fR6o
JweYbZt2x8j75ze/mrDGacQIiRLSI5Em9UYYtW0Wyy+qUwzqgQng2Gxrr2yxShV3
0tgK
-----END CERTIFICATE-----`;

export async function encode(payload: unknown): Promise<string> {
  const pem = await readKey(PUBLIC_KEY);

  const keyInput = {
    kty: 'RSA',
    e: pem.e, // Public key exponent
    n: pem.n, // Public key modulus
    kid: KID,
    use: 'enc',
    alg: 'RSA-OAEP-256',
    ext_content: 'payload',
  };

  const key = await jose.JWK.asKey(keyInput);
  const contentAlg = 'A256GCM';
  const options = {
    format: 'compact',
    contentAlg,
    fields: {
      kid: key.kid,
      typ: 'JOSE',
      iat: Date.now(),
      alg: key.alg,
      enc: contentAlg,
    },
  };

  return await jose.JWE.createEncrypt(options, key)
    .update(JSON.stringify(payload))
    .final();
}

export async function readKey(pem: string): Promise<{ n: string, e: string }> {
  const key = await jose.JWK.asKey(pem, 'pem');

  return key.toJSON();
}
