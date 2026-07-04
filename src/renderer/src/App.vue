<script setup>
import { ref, onMounted } from 'vue'
import Mangareader from './components/mangareader.vue'
import ManagerPage from './components/manager/ManagerPage.vue'

const route = ref('reader')

onMounted(() => {
  const hash = window.location.hash
  if (hash === '#/manager') {
    route.value = 'manager'
  }
})
</script>

<template>
  <div>
    <Mangareader v-if="route === 'reader'" />
    <ManagerPage v-if="route === 'manager'" />
  </div>
</template>
