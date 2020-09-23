<template>
  <Header/>
  <div class="container">
    <router-view/>
  </div>
  <Footer/>
</template>

<style lang="scss">
  @import 'styles/variables';
  @import 'styles/forms';

  .container {
    width: 100%;
    max-width: 900px;
    margin: auto;
  }

  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3 {
    font-weight: normal;
  }

</style>

<script>
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';

export default {
  components: { Header, Footer },
};
</script>
