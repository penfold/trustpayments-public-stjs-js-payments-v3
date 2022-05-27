import { SrcName } from '../digital-terminal/SrcName';
import { ISrcProfileList } from '../digital-terminal/ISrc';

export const srcProfilesMock: Record<SrcName, ISrcProfileList> = {
  VISA: {
    profiles: [
      {
        idToken:
          'eyJraWQiOiJvdXRib3VuZF90ZXN0IiwidHlwIjoiSldUK2V4dC5pZF90b2tlbiIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJ0UnVtZHliSmZqTmFsYVJjYmx1WnUwRmh1NG4wZm9wR2FMOWV6ZWwwN1dFPSIsImF1ZCI6WyJodHRwczovL2VncmVzcy50cnVzdHBheW1lbnRzLmRldiIsImh0dHBzOi8vcXd3dy5hZXhwLXN0YXRpYy5jb20iLCJodHRwczovL3d3dy52aXNhLmNvbSIsImh0dHBzOi8vc3JjLmRpc2NvdmVyLmNvbSIsImh0dHBzOi8vd3d3LmFtZXJpY2FuZXhwcmVzcy5jb20iLCJodHRwczovL3Rlc3QuY29tIiwiaHR0cHM6Ly9tYXN0ZXJjYXJkLmNvbSIsImh0dHBzOi8vd3d3LnZpdnlhbnRlc3QuY29tIl0sImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhbXIiOlsiZW1haWxfb3RwIiwib3RwIl0sImF1dGhfdGltZSI6MTY0ODczNzAzMywiaXNzIjoiaHR0cHM6Ly93d3cudmlzYS5jb20iLCJzcmNfZW1haWxfbWFzayI6InNlYyoqQGdtYWlsLmNvbSIsImV4cCI6MTY0ODczNzUxNSwiaWF0IjoxNjQ4NzM3MDM1LCJqdGkiOiJNMlkwTkRCaE1EQXRNakV4WVMwME56WXlMVGxsWm1ZdFlqWTROalkyTm1ReE5UWXkiLCJlbWFpbCI6InRSdW1keWJKZmpOYWxhUmNibHVadTBGaHU0bjBmb3BHYUw5ZXplbDA3V0U9In0.fIgZbQFJibf9DRQr1HWf3MJGOUqwkwhFk0M5HaF-uVQu3I-Jcfx5KJ03-8NggxsaaG4uXFWOWX8gf4CQuWGmklyum1dA5fcI8IeFMANr8aWRX6IZV0WPg3P2L06xts28Fm-BoqJ-W0V6Pqhq78Y-Mj2p3Uobzr86C1BfT2o-WvGHAXfL4A1QOlf8o9tYYXDsAhMUyDnvPiS5OXNY3WNROxxq4-AS4lCCJSk6tzmXFQhw3Sq37hH2saj7Vs-2npkSfxR2MC9P4fQDwFpzL93R0iVIEfs5ibaYR0Om0ULBsTmUin8YUO1cR3ZdXjsnp8JkfmMw9R_U1WWDQjQw-1_Sxg',
        maskedCards: [
          {
            dateOfCardCreated: '2022-03-24T10:59:49.976Z',
            dateOfCardLastUsed: '2022-03-31T10:32:59.852Z',
            digitalCardData: {
              artHeight: 105,
              artUri:
                'https://sandbox.secure.checkout.visa.com/VmeCardArts/lKb9eM4Yc5aYXs473qwBj-0YkVAOfk4CBfzeZ-7hG_I.png',
              artWidth: 164,
              status: 'ACTIVE',
            },
            maskedBillingAddress: {
              addressId: 'd27bd9b8-c8c8-0e02-d361-16dabd384601',
              city: '*****',
              countryCode: 'GB',
              line1: '1 F*****',
              line2: null,
              line3: null,
              state: null,
              zip: '*****',
              createTime: null,
              lastUsedTime: null,
            },
            panBin: null,
            panExpirationMonth: 12,
            panExpirationYear: 2022,
            panLastFour: 1111,
            srcDigitalCardId: 'dce8b97a-0bae-0e0a-8aa6-104f1e995f02',
            dcf: {
              uri: 'string',
              logoUri: 'string',
              name: 'string',
            },
            paymentAccountReference: 'string',
            tokenBinRange: 'test',
            tokenLastFour: 1234,
          },
        ],
        maskedConsumer: {
          firstName: 'P*****',
          lastName: 't*****',
          fullName: 'P***** t*****',
          emailAddress: 'sec**@gmail.com',
          countryCode: 'GB',
          languageCode: 'en-GB',
          mobileNumber: {
            countryCode: 'PL',
            phoneNumber: '123456789',
          },
        },
      },
    ],
    srcCorrelationId: '123',
  },
};
