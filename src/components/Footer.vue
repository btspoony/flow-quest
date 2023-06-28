<script setup lang="ts">
import { Icon } from '@iconify/vue';
</script>

<template>
  <footer class="w-full h-12 mt-4">
    <div class="h-full container flex-between">
      <small>© {{ new Date().getFullYear() }} All rights reserved.</small>
      <div class="flex-center gap-2">
        <small>Get support on
          <NuxtLink to="https://discord.gg/emeraldcity" target="_blank">Emerald City DAO</NuxtLink>
        </small>
        <NuxtLink to="https://twitter.com/btspoony" target="_blank" rel="noopener noreferrer">
          <Icon icon="logos:twitter" class="w-5 h-5" />
        </NuxtLink>
        <NuxtLink to="https://github.com/btspoony/flow-quest" target="_blank" class="secondary">
          <Icon icon="uil:github" class="w-6 h-6" />
        </NuxtLink>
      </div>
    </div>
  </footer>
</template>
