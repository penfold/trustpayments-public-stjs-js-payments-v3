import { faker } from '@faker-js/faker';
import { ISrcProfileList } from '../../ISrc';
import { IMastercardSrc, IMastercardSrcProfileList, MasterCardIdentityType } from './IMastercardSrc';
import { MastercardSrcWrapper } from './MastercardSrcWrapper';

const mockMasterCardProfileList: IMastercardSrcProfileList = {
  profiles: [{
    authorization: faker.datatype.uuid(),
    maskedCards: [],
    maskedConsumer: {
      maskedMobileNumber: {
        countryCode: faker.address.countryCode(),
        maskedPhoneNumber: faker.phone.phoneNumber(),
      },
      countryCode: faker.address.countryCode(),
      maskedFirstName: faker.name.firstName(),
      maskedLastName: faker.name.lastName(),
      maskedFullName: `${faker.name.firstName()} ${faker.name.lastName()}`,
      languageCode: faker.address.countryCode(),
      maskedEmailAddress: faker.internet.email(),
      dateConsumerAdded: faker.date.past().getTime(),
      maskedConsumerIdentity: {
        identityValue: faker.internet.email(),
        identityProvider: 'SRC',
        identityType: MasterCardIdentityType.EMAIL,
      },
      complianceSettings: null,
      srcConsumerId: faker.datatype.uuid(),
      dateConsumerLastUsed: faker.date.recent().getTime(),
      maskedNationalIdentifier: null,
      status: 'ACTIVE',
    },
    maskedShippingAddresses: [],
  }],
  scrCorrelationId: faker.datatype.uuid(),
};
const mastercardSrcMock: Partial<IMastercardSrc> = {};
const testTokens = [faker.datatype.uuid(), faker.datatype.uuid()];

describe('MastercardSrcWrapper', () => {
  let sut: MastercardSrcWrapper;
  beforeEach(() => {
    mastercardSrcMock.getSrcProfile = jest.fn().mockResolvedValue(mockMasterCardProfileList);
    // @ts-ignore
    window.SRCSDK_MASTERCARD = function() {
      return mastercardSrcMock;
    };
    sut = new MastercardSrcWrapper();
  });

  // TODO update tests
  describe('getSrcProfile()', () => {
    it('should call getSrcProfile method from Mastercard SRC SDK and return result mapped to ISrcProfileFormat', done => {

      sut.getSrcProfile(testTokens).then((result) => {
        expect(result).toMatchObject({
          srcCorrelationId: mockMasterCardProfileList.scrCorrelationId,
          profiles: [
            {
              idToken: mockMasterCardProfileList.profiles[0].authorization,
              maskedCards: mockMasterCardProfileList.profiles[0].maskedCards,
              maskedConsumer: {
                emailAddress: mockMasterCardProfileList.profiles[0].maskedConsumer.maskedEmailAddress,
                languageCode: mockMasterCardProfileList.profiles[0].maskedConsumer.languageCode,
                fullName: mockMasterCardProfileList.profiles[0].maskedConsumer.maskedFullName,
                lastName: mockMasterCardProfileList.profiles[0].maskedConsumer.maskedLastName,
                firstName: mockMasterCardProfileList.profiles[0].maskedConsumer.maskedFirstName,
                countryCode: mockMasterCardProfileList.profiles[0].maskedConsumer.countryCode,
                mobileNumber: {
                  countryCode: mockMasterCardProfileList.profiles[0].maskedConsumer.maskedMobileNumber?.countryCode,
                  phoneNumber: mockMasterCardProfileList.profiles[0].maskedConsumer.maskedMobileNumber?.maskedPhoneNumber,
                },
              },
            },
          ],
        } as ISrcProfileList);
      });
      done();
    });
  });

  it('if argument is passed it should be mapped to match Mastercard SDK method signature', done => {
    sut.getSrcProfile(testTokens).then((result) => {
      // @ts-ignore
      expect(mastercardSrcMock.getSrcProfile).toHaveBeenCalledWith({ idTokens: testTokens });
      done();
    });
  });
});
