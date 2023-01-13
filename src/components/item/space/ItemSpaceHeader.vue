<script setup lang="ts">
import { Icon } from '@iconify/vue';

const props = defineProps<{
  space: CommunitySpaceBasics
}>()
</script>

<template>
  <div class="w-full card card-border non-interactive p-5 min-h-[8rem] relative flex items-stretch gap-8">
    <div class="self-center w-16 h-16 rounded-full overflow-hidden">
      <img v-if="space.display.imageUrl" :src="getIPFSUrl(space.display.imageUrl)" alt="Space Logo" />
    </div>
    <div class="flex-auto flex gap-2 items-start flex-col md:flex-row md:gap-0 md:items-end">
      <div class="self-center flex-1 max-w-md headings mb-0">
        <h2>{{ space.display.name }}</h2>
        <p>{{ space.display.description }}</p>
      </div>
      <div class="flex-1 min-w-max flex justify-end">
        <div class="flex items-center justify-end gap-3">
          <NuxtLink v-if="space.display?.socials?.twitter" :to="space.display?.socials?.twitter" target="_blank"
            rel="noopener noreferrer">
            <Icon icon="logos:twitter" class="w-5 h-5" />
          </NuxtLink>
          <NuxtLink v-if="space.display?.socials?.discord" :to="space.display?.socials?.discord" target="_blank"
            rel="noopener noreferrer">
            <Icon icon="logos:discord-icon" class="w-5 h-5" />
          </NuxtLink>
          <NuxtLink v-if="space.display?.socials?.website" :to="space.display?.socials?.website" target="_blank"
            rel="noopener noreferrer">
            <Icon icon="heroicons:globe-alt" class="w-5 h-5" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
