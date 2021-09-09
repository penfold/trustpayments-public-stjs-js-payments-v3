<template>
  <h1>{{pageTitle}}</h1>
  <h3>This is a VueJS Example page for the Trust Payments library.</h3>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

const defaultTitle = 'VueJS Example';

const component = defineComponent({
  props: {
    title: {
      type: String,
      required: false,
    },
  },
  setup: (props) => ({
    pageTitle: props.title || defaultTitle,
  }),
});

export default component;
</script>

<style scoped>

</style>
