<script setup lang="ts">
import { Icon } from '@iconify/vue';

const route = useRoute()
const isDrawerOpened = useAppDrawerOpened();

function isCurrentInActivePage(pageKey: string): boolean {
  return !route.path.startsWith(`/${pageKey}`)
}

const menus = reactive([
  { path: 'active', display: 'Competition', icon: 'fire-20-solid', iconClass: 'text-secondary' },
  { path: 'leaderboard', display: 'Leaderboard', icon: 'chart-bar-square-20-solid', iconClass: '' },
])

function closeDrawer() {
  if (isDrawerOpened.value) {
    isDrawerOpened.value = false
  }
}
</script>

<template>
  <li v-for="menu in menus" :key="menu.path" class="menu-item" @click="closeDrawer()">
    <NuxtLink :to="geneReferralLink(`/${menu.path}`)"
      :class="['inline-flex-between', { secondary: isCurrentInActivePage(menu.path) }]">
      <Icon :icon="`heroicons:${menu.icon}`" :class="['w-6 h-6', menu.iconClass]" inline />
      {{ menu.display }}
    </NuxtLink>
  </li>
</template>

<style scoped>
.menu-item {
  @apply flex-center text-lg font-medium;
}
</style>
