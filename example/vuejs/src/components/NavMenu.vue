<template>
  <div class="nav-menu">
    <div class="container nav-container">
      <router-link to="/">Home</router-link>
      <router-link to="/payment-details">Payment Details</router-link>
      <router-link to="/personal-data">Personal Data</router-link>
      <router-link to="/contact-data">Contact Data</router-link>
      <router-link to="/payment">Payment</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NavMenu',
};
</script>

<style scoped lang="scss">
  @import '../styles/variables';

  .nav-menu {
    background: #f5f5f5;
    margin: 10px 0;

    .nav-container {
      display: flex;
      a {
        display: block;
        padding: 20px;
        min-width: 120px;
        color: #888;
        text-align: center;
        text-decoration: none;

        &.router-link-exact-active {
          color: #000;
          font-weight: bold;
          border-bottom: 2px solid $color-accent;
        }
      }
    }
  }
</style>
