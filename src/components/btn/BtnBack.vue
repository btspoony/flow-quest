<script setup lang="ts">
import { Icon } from '@iconify/vue';

function back() {
  const router = useRouter()
  router.back()
}
</script>

<template>
  <a href="#" role="button" class="secondary outline rounded-full w-12 h-12 inline-flex-center" @click="back">
    <Icon icon="heroicons:arrow-uturn-left-20-solid" class="w-5 h-5" />
  </a>
</template>
