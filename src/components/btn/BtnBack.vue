<script setup lang="ts">
import { Icon } from '@iconify/vue';

function back() {
  const router = useRouter()
  router.back()
}
</script>

<template>
  <a href="#" role="button" class="secondary outline !rounded-full" @click="back">
    <Icon icon="heroicons:arrow-uturn-left-20-solid" class="w-4 h-4" />
  </a>
</template>
