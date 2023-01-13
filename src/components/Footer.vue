<script setup lang="ts">
import { Icon } from '@iconify/vue';
</script>

<template>
  <footer class="w-full h-12 mt-4">
    <div class="h-full container flex-between">
      <small>Copyright © {{ new Date().getFullYear() }} Flow</small>
      <div class="flex-center gap-2">
        <NuxtLink to="https://github.com/btspoony/flow-challenge-tour" target="_blank" class="secondary">
          <Icon icon="uil:github" class="w-6 h-6" />
        </NuxtLink>
      </div>
    </div>
  </footer>
</template>
