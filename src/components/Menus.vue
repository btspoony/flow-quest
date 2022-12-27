<script setup lang="ts">
import { FireIcon, ChartBarSquareIcon } from "@heroicons/vue/24/solid";

const route = useRoute()
const isDrawerOpened = useAppDrawerOpened();

function isCurrentInActivePage(pageKey: string): boolean {
  return !route.path.startsWith(`/${pageKey}`)
}

const menus = reactive([
  { path: 'active', display: 'Competition', icon: FireIcon, iconClass: 'fill-secondary' },
  { path: 'leaderboard', display: 'Leaderboard', icon: ChartBarSquareIcon, iconClass: 'fill-current' },
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
      <Component :is="menu.icon" :class="['w-6 h-6', menu.iconClass]" />
      {{ menu.display }}
    </NuxtLink>
  </li>
</template>

<style scoped>
.menu-item {
  @apply flex-center text-lg font-medium;
}
</style>
