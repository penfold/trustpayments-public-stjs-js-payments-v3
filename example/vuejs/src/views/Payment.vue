<template>
  <PageTitle title="Payment"/>
  <PaymentForm/>
</template>

<script>
import PaymentForm from '@/components/PaymentForm.vue';
import PageTitle from '@/components/PageTitle.vue';

export default {
  name: 'Payment',
  components: {
    PageTitle,
    PaymentForm,
  },
};
</script>

<style scoped>

</style>
