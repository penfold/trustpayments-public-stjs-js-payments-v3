<template>
  <div class="container header">
    <img class="top-logo" alt="Trust Payments logo" src="../assets/tp-logo.jpg">
    <h1 class="top-title">VueJS Example</h1>
  </div>
  <NavMenu></NavMenu>
</template>

<script>
import NavMenu from './NavMenu.vue';

export default {
  name: 'Header',
  components: { NavMenu },
};
</script>

<style scoped lang="scss">
  @import "../styles/variables";

  .header {
    display: flex;
    align-items: center;
  }

  .top-title {
    color: $color-accent;
    font-weight: normal;
  }

  .top-logo {
    max-width: 150px;
    margin-right: 20px;
  }
</style>
