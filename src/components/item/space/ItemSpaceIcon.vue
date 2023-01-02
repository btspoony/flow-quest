<script setup lang="ts">
import { PlusIcon } from '@heroicons/vue/24/solid';

const props = defineProps<{
  space: CommunitySpaceBasics | null
}>()

const emit = defineEmits<{
  (e: 'select', key: string, owner: string, id: string): void,
  (e: 'create'): void,
}>()

const isCurrentActive = ref(false)
</script>

<template>
  <div :class="['group cursor-pointer w-14 px-2 relative flex items-center', isCurrentActive ? 'active' : '']">
    <div
      class="absolute right-0 h-3 w-1 rounded-full transition-all duration-300 group-hover:bg-current group-[.active]:bg-current !group-[.active]:h-5" />
    <div class="rounded-full flex-center border border-solid border-current w-10 h-10">
      <template v-if="space">
        <img :src="getIPFSUrl(space?.display.imageUrl!)" class="rounded-full w-10 h-10" />
      </template>
      <PlusIcon v-else class="fill-current w-6 h-6" />
    </div>
  </div>
</template>
