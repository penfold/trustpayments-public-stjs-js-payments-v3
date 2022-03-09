import { uuid } from '../uuid';
import { encode } from './mastercard-encode';

const INITIATOR_ID = 'f621a412-9acc-4186-9c60-84f272090b60';
const DPA_ID = 'TestMerchant';

window.addEventListener('load', async () => {
  // @ts-ignore
  const vSrc = window.SRCSDK_MASTERCARD;
  const srciTransactionId = uuid();

  async function init() {
    return vSrc.init({
      srciTransactionId: srciTransactionId,
      srcInitiatorId: INITIATOR_ID,
      srciDpaId: DPA_ID,
      dpaTransactionOptions: {
        dpaLocale: 'en_US',
        consumerNameRequested: false,
        consumerEmailAddressRequested: false,
        consumerPhoneNumberRequested: false,
        reviewAction: 'pay',
        transactionAmount: {
          transactionAmount: 100.00,
          transactionCurrencyCode: 'GBP',
        },
      },
    });
  }

  async function isRecognized() {
    return vSrc.isRecognized();
  }

  async function identityLookup() {
    console.log('awaiting email');

    const email = prompt('Email address', '');

    if (!email?.length) {
      return Promise.resolve(null);
    }

    console.log({
      identityValue: email,
      identityType: 'EMAIL_ADDRESS',
    });

    return vSrc.identityLookup({
      consumerIdentity: {
        identityValue: email,
        identityType: 'EMAIL_ADDRESS',
      },
    });
  }

  async function initiateIdentityValidation() {
    return vSrc.initiateIdentityValidation();
  }

  async function completeIdentityValidation(tokens) {
    const code = window.prompt('OTP');
    const result = vSrc.completeIdentityValidation(code);

    tokens.push(result.idToken);

    return result;
  }

  async function getSrcProfile(tokens) {
    return vSrc.getSrcProfile(tokens);
  }

  function selectCardId(maskedCards) {
    if (!maskedCards?.length) {
      return null;
    }

    let i = 1;
    let promptDescription = 'Select card (empty for new one):\n';

    maskedCards.forEach(card => {
      promptDescription += `${i++}: **** **** **** ${card.panLastFour} - ${card.panExpirationMonth}/${card.panExpirationYear}\n`;
    });

    const selectedIndex = prompt(promptDescription);

    return selectedIndex ? maskedCards[Number.parseInt(selectedIndex) - 1].srcDigitalCardId : null;
  }

  function collectCardDetails() {
    return {
      primaryAccountNumber: prompt('PAN', '5200000000001005'),
      panExpirationMonth: prompt('Expiry month', '01'),
      panExpirationYear: prompt('Expiry year', '2024'),
      cardSecurityCode: prompt('Security code', '123'),
      cardholderFullName: prompt('Cardholder name', 'John Smith'),
    }
  }

  async function checkout(srciTransactionId, srcProfileResult) {
    const profile = srcProfileResult?.profiles[0] || {};
    const cardId = selectCardId(profile.maskedCards);
    let encryptedCard;

    if (cardId === null) {
      encryptedCard = await encode(collectCardDetails());
    }

    return vSrc.checkout({
      srcCorrelationId: srcProfileResult?.srcCorrelationId,
      srciTransactionId: srciTransactionId,
      srcDigitalCardId: cardId,
      encryptedCard,
      idToken: profile?.idToken,
      windowRef: '',
    });
  }

  async function click2pay() {
    const idTokens = [];

    await init();
    const recognizedResult = await isRecognized();
    console.log('IS RECOGNIZED', recognizedResult);

    if (recognizedResult.recognized) {
      recognizedResult.idTokens.forEach(token => {
        idTokens.push(token);
      });
    } else {
      const identityLookupResult = await identityLookup();
      console.log('IDENTITY LOOKUP', identityLookupResult);

      if (identityLookupResult?.consumerPresent) {
        console.log('INITIATE IDENTITY VALIDATION', await initiateIdentityValidation());
        console.log('COMPLETE VALIDATION', await completeIdentityValidation(idTokens));
      }
    }

    let srcProfileResult;

    if (idTokens.length) {
      srcProfileResult = await getSrcProfile(idTokens);
      console.log('GET SRC PROFILE', srcProfileResult);
    }

    console.log('CHECKOUT', await checkout(srciTransactionId, srcProfileResult));
  }

  document.getElementById('click2pay').addEventListener('click', () => click2pay());
});
