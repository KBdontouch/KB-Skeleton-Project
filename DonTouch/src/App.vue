<script setup>
import Footer from './components/Footer.vue';
</script>
<template>
  <RouterView name="side"></RouterView>
  <div>
    <RouterView />
  </div>
  <Footer />
</template>

<script setup></script>

<style scoped></style>
