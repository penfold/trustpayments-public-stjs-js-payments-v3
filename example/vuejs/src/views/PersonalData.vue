<template>
  <PageTitle title="Personal data"/>
  <form class="st-form">
    <fieldset>
      <legend>Personal data</legend>
      <div class="form-row">
        <select class="st-select">
          <option disabled selected hidden>Title</option>
          <option>Mr</option>
          <option>Mrs</option>
          <option>Ms</option>
          <option>Miss</option>
          <option>Dr</option>
        </select>
        <input type="text" placeholder="First name" class="st-input" />
        <input type="text" placeholder="Last name" class="st-input" />
      </div>
      <div class="form-row">
        <input type="date" placeholder="Date of birth" class="st-input" />
      </div>
    </fieldset>
    <div class="form-row">
      <button type="submit"
              class="st-button"
              @click="$router.push('contact-data')">Continue
      </button>
    </div>
  </form>
</template>

<script>
import PageTitle from '@/components/PageTitle.vue';

export default {
  name: 'PersonalData',
  components: {
    PageTitle,
  },
};
</script>

<style scoped>

</style>
