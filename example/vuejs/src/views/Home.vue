<template>
  <PageTitle/>
  <PaymentForm/>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import PaymentForm from '@/components/PaymentForm.vue';
import PageTitle from '@/components/PageTitle.vue';

@Options({
  components: {
    PaymentForm,
    PageTitle,
  },
})
export default class Home extends Vue {}
</script>
