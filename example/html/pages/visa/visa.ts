import { uuid } from './uuid';
import { encode } from './encode';

const INITIATOR_ID = 'GSTIDU1J8I2NQRWAU7EL21puifGrG2BzgnL9XfBjMzwo9wmtM';
const DPA_ID = 'TrustPayments-test-merchant';

window.addEventListener('load', async () => {
  // @ts-ignore
  const vSrcAdapter = window.vAdapters.VisaSRCI;
  const vSrc = new vSrcAdapter();
  const srciTransactionId = uuid();

  async function init() {
    return vSrc.init({
      srciTransactionId: srciTransactionId,
      srcInitiatorId: INITIATOR_ID,
      srciDpaId: DPA_ID,
      dpaTransactionOptions: {
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
    return vSrc.identityLookup({
      identityValue: 'wirus15+vcteste4h5@gmail.com',
      type: 'EMAIL',
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
      card: {
        primaryAccountNumber: prompt('PAN', '4111111111111111'),
        panExpirationMonth: prompt('Expiry month', '01'),
        panExpirationYear: prompt('Expiry year', '2022'),
        cardSecurityCode: prompt('Security code', '123'),
        cardholderFullName: prompt('Cardholder name', 'John Smith'),
      },
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

      if (identityLookupResult.consumerPresent) {
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
