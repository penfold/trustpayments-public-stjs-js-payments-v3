<template>
  <div id="st-popup" class="st-popup"></div>
  <form id="st-form-tokenized"
        action="https://www.example.com"
        class="st-form">
    <fieldset>
      <legend>Tokenized card payment</legend>
      <select id="tokenized-card-select"
              @change="changeCard($event)">
        <option value="card1">VISA</option>
        <option value="card2">MASTERCARD</option>
      </select>

      <fieldset id="st-card-payment-tokenized" class="st-form__fieldset">
        <legend>Credit card details:</legend>
        <div id="st-tokenized-security-code"></div>
      </fieldset>

      <div class="st-form__group st-form__group--submit">
        <button type="submit"
                class="st-button"
                id="tokenized-submit-button"
                disabled>
          Pay
        </button>
      </div>
    </fieldset>
  </form>

  <form class="st-form" v-bind:id="pageOptions.formId">

    <div id="st-notification-frame" class="st-form__group"></div>
    <fieldset>
      <legend>Payment details</legend>
      <div class="form-row">
        <input type="text" placeholder="Price" class="st-input" @change="updateJwt()" />
        <input type="text" placeholder="Amount" class="st-input" @change="updateJwt()" />
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
      <legend>APM"s</legend>
      <div id="st-visa-checkout"></div>
      <div id="st-apple-pay"></div>
      <div id="st-google-pay"></div>
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
      <button type="submit"
              class="st-button"
              v-if="!pageOptions.noSubmitButton"
              v-bind:id="pageOptions.submitButtonId">Pay
      </button>
    </div>
    <div class="form-row" v-if="pageOptions.additionalButton">
      <button type="submit"
              class="st-button"
              v-bind:id="pageOptions.additionalButtonId">Extra button
      </button>
    </div>
  </form>
</template>

<script lang="ts">
import { onMounted, defineComponent } from 'vue';
import { useToast } from 'vue-toastification';
import { useRoute } from 'vue-router';
import loadLibrary from '@/services/load-library';
import loadConfig from '@/services/load-config';
import resolvePageOptions from '@/services/page-options/resolve-page-options';
import mergeOptions from '@/services/page-options/merge-options';
import loadJwt from '@/services/load-jwt';

let tokenizedCardPaymentAdapterPromise: Promise<any>;

export default defineComponent({
  setup() {
    const { query } = useRoute();
    const toast = useToast();
    const pageOptions = resolvePageOptions(query);
    let st: any;

    onMounted(() => {
      loadLibrary().then((SecureTrading) => {
        Promise.all([loadConfig(), loadJwt('card1-tokenizedJwtData.json')])
          .then((values) => [
            mergeOptions(values[0], pageOptions), values[1]
          ])
          .then((values) => {
            const config = values[0];
            const tokenizedJwt = values[1];
            st = SecureTrading(config);
            st.Components(config.components);
            st.VisaCheckout(config.visaCheckout);
            st.ApplePay(config.applePay);
            st.GooglePay(config.googlePay);
            tokenizedCardPaymentAdapterPromise = st.TokenizedCardPayment(
              tokenizedJwt,
              config.tokenizedCard
            );

            if (!config.successCallback) {
              st.on('success', () => toast.success('Payment completed successfully'));
            }

            if (!config.errorCallback) {
              st.on('error', () => toast.error('An error occurred'));
            }

            if (!config.submitCallback) {
              st.on('submit', (data) => {
                console.log(`This is what we have got after submit ${JSON.stringify(data)}`);
              });
            }
          });
      });
    });

    function updateJwt(): void {
      if (pageOptions.updatedJwt) {
        st.updateJWT(pageOptions.updatedJwt);
      }
    }

    function changeCard(value: Event): void {
      const fileName: string = (value.target as any).value;

      loadJwt(`${fileName}-tokenizedJwtData.json`).then((jwt: string) => {
        tokenizedCardPaymentAdapterPromise.then((tokenizedCardPaymentAdapter) => {
          tokenizedCardPaymentAdapter.updateTokenizedJWT(jwt);
        });
      });
    }

    return {
      pageOptions,
      updateJwt,
      changeCard
    };
  }
});
</script>

<style scoped lang="scss">
.st-form-container {
  display: flex;

  .card-details {
    display: flex;
    flex-grow: 1;
    flex-direction: column;
  }

  .animated-card,
  .animated-card > #st-animated-card {
    display: flex;
    flex-grow: 1;
  }
}
</style>
