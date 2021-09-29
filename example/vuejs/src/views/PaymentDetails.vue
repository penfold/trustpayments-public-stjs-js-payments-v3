<template>
  <PageTitle title="Payment details"/>
  <form class="st-form">
    <fieldset>
      <legend>Payment details</legend>
      <div class="form-row">
        <input type="text" placeholder="Price" class="st-input" />
        <input type="text" placeholder="Amount" class="st-input" />
      </div>
      <div class="form-row">
        <select class="st-select">
          <option disabled selected hidden>Type of payment</option>
          <option>one-off payment</option>
          <option>monthly payment</option>
        </select>
      </div>
    </fieldset>
    <div class="form-row">
      <button type="submit"
              class="st-button"
              @click="$router.push('personal-data')">Continue
      </button>
    </div>
  </form>
</template>

<script>
import PageTitle from '@/components/PageTitle.vue';

export default {
  name: 'PaymentDetails',
  components: {
    PageTitle,
  },
};
</script>

<style scoped>

</style>
