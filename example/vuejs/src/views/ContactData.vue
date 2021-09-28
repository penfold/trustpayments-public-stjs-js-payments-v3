<template>
  <PageTitle title="Contact data"/>
  <form class="st-form">
    <fieldset>
      <legend>Contact data</legend>
      <div class="form-row">
        <input type="email" placeholder="E-mail" class="st-input" />
        <input type="tel" placeholder="Phone" class="st-input" />
      </div>
      <div class="form-row">
        <input type="text" placeholder="Street" class="st-input" />
        <input type="text" placeholder="City" class="st-input" />
      </div>
    </fieldset>
    <div class="form-row">
      <button type="submit"
              class="st-button"
              @click="$router.push('payment')">Continue
      </button>
    </div>
  </form>
</template>

<script>
import PageTitle from '@/components/PageTitle.vue';

export default {
  name: 'ContactData',
  components: {
    PageTitle,
  },
};
</script>

<style scoped>

</style>
