<script setup lang="ts">
const props = defineProps<{
  communityId: string
}>()

const { data, pending } = useAsyncData<CommunitySpaceBasics | null>(`community:${props.communityId}`, async () => {
  return await apiSpaceGetBasics(props.communityId)
}, {
  server: false
})

</script>

<template>
  <span class="tag inline-flex-around">
    <div v-if="pending" :aria-busy="true" />
    <template v-else-if="data">
      <img :src="getIPFSUrl(data?.display.imageUrl!)" class="rounded-full w-4 h-4" />
      {{ data?.display.name }}
    </template>
    <template v-else>{{ communityId }}</template>
  </span>
</template>
