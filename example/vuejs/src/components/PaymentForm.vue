<template>
  <form class="st-form" id="st-form">
    <div id="st-popup" class="st-popup"></div>
    <div id="st-notification-frame" class="st-form__group"></div>
    <fieldset>
      <legend>Payment details</legend>
      <div class="form-row">
        <input type="text" placeholder="Price" class="st-input" />
        <input type="text" placeholder="Amount" class="st-input" />
      </div>
      <div class="form-row">
        <input type="text" placeholder="Name" class="st-input" />
        <input type="email" placeholder="Email" class="st-input" />
        <input type="phone" placeholder="Phone" class="st-input" />
      </div>
      <div class="form-row">
        <select class="st-select">
          <option disabled selected hidden>Type of payment</option>
          <option>one-off payment</option>
          <option>monthly payment</option>
        </select>
      </div>
    </fieldset>
    <fieldset>
      <legend>APM's</legend>
      <div id="st-visa-checkout"></div>
      <div id="st-apple-pay"></div>
    </fieldset>
    <fieldset>
      <legend>Credit card details</legend>
      <div class="st-form-container">
        <div class="card-details">
          <div id="st-card-number" class="form-row"></div>
          <div id="st-expiration-date" class="form-row"></div>
          <div id="st-security-code" class="form-row"></div>
        </div>
        <div class="animated-card">
          <div id="st-animated-card"></div>
        </div>
      </div>
      <div id="st-control-frame"></div>
    </fieldset>
    <div class="form-row">
      <button type="submit" class="st-button" id="merchant-submit-button">Pay</button>
    </div>
  </form>
</template>

<script lang="ts">
import { onMounted } from 'vue';

declare const SecureTrading: any;

export default {
  setup() {
    onMounted(() => {
      const config = {
        analytics: true,
        applePay: {
          buttonStyle: 'white-outline',
          buttonText: 'buy',
          merchantId: 'merchant.net.securetrading.test',
          paymentRequest: {
            countryCode: 'US',
            currencyCode: 'USD',
            merchantCapabilities: [
              'supports3DS',
              'supportsCredit',
              'supportsDebit',
            ],
            requestTypes: [
              'RISKDEC',
              'ACCOUNTCHECK',
              'AUTH',
            ],
            supportedNetworks: [],
            total: {
              label: 'Secure Trading Merchant',
              amount: '10.00',
            },
          },
          placement: 'st-apple-pay',
        },
        animatedCard: true,
        buttonId: 'merchant-submit-button',
        bypassCards: [
          'PIBA',
        ],
        cancelCallback: null,
        componentIds: {
          animatedCard: '',
          cardNumber: '',
          expirationDate: '',
          notificationFrame: '',
          securityCode: '',
        },
        components: {
          defaultPaymentType: '',
          requestTypes: [
            'RISKDEC',
            'ACCOUNTCHECK',
            'THREEDQUERY',
            'AUTH',
          ],
          paymentTypes: [],
          startOnLoad: false,
        },
        cybertonicaApiKey: 'stfs',
        datacenterurl: '',
        deferInit: false,
        disableNotification: false,
        errorCallback: null,
        errorReporting: false,
        fieldsToSubmit: [
          'pan',
          'expirydate',
          'securitycode',
        ],
        formId: 'st-form',
        init: {
          cachetoken: '',
          threedinit: '',
        },
        jwt: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhbTAzMTAuYXV0b2FwaSIsImlhdCI6MTYwMDg4MzUyMi45ODM1NjE4LCJwYXlsb2FkIjp7ImJhc2VhbW91bnQiOiIxMDAwIiwiYWNjb3VudHR5cGVkZXNjcmlwdGlvbiI6IkVDT00iLCJjdXJyZW5jeWlzbzNhIjoiR0JQIiwic2l0ZXJlZmVyZW5jZSI6InRlc3RfamFtZXMzODY0MSIsImxvY2FsZSI6ImVuX0dCIn19.Qsf3Re2xK1REJ19FC8-Acxf1ksNOQdsZZDqsut1zNkA',
        livestatus: 0,
        origin: '',
        panIcon: true,
        placeholders: {
          pan: 'Card number',
          expirydate: 'MM/YY',
          securitycode: '***',
        },
        styles: {
          defaultStyles: {
            'background-color-input': 'AliceBlue',
          },
          cardNumber: {
            'font-size-input': '1.5rem',
            'line-height-input': '1.6rem',
          },
          expirationDate: {
            'font-size-input': '1.5rem',
            'line-height-input': '1.6rem',
          },
          securityCode: {
            'font-size-input': '1.5rem',
            'line-height-input': '1.6rem',
          },
          notificationFrame: {
            'color-error': '#FFF333',
          },
          controlFrame: {
            'color-error': '#3358FF',
          },
        },
        submitCallback: null,
        submitFields: [],
        submitOnSuccess: false,
        submitOnError: false,
        submitOnCancel: false,
        successCallback: null,
        translations: {
          'An error occurred': 'Wystąpił błąd',
        },
        visaCheckout: {
          buttonSettings: {
            size: '154',
            color: 'neutral',
          },
          livestatus: 0,
          merchantId: 'SDUT1MEXJO10RARJF2S521ImTyKfn3_JmxePdXcydQIUb4kx4',
          paymentRequest: {
            subtotal: '20.00',
          },
          placement: 'st-visa-checkout',
          requestTypes: [
            'RISKDEC',
            'ACCOUNTCHECK',
            'AUTH',
          ],
          settings: {
            displayName: 'My Test Site',
          },
        },
      };

      const st = SecureTrading(config);
      st.Components(config.components);
    });
  },
};
</script>

<style scoped lang="scss">
.st-form-container {
  display: flex;

  .card-details {
    display: flex;
    flex-grow: 2;
    flex-direction: column;
  }

  .animated-card {
    display: flex;
    flex-grow: 1;
  }
}
</style>
