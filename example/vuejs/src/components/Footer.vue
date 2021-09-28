<template>
  <div class="footer">
    Trust Payments <span class="copy">&copy;</span> {{year}}
  </div>
</template>

<script lang="ts">
import { ref } from 'vue';

export default {
  setup() {
    const year = ref(new Date().getFullYear());

    return {
      year,
    };
  },
};
</script>

<style scoped lang="scss">
  @import '../styles/variables';

  .footer {
    margin: 30px;
    text-align: center;
    font-size: 11px;

    .copy {
      color: $color-accent;
    }
  }
</style>
