<script setup lang="ts">
definePageMeta({
  key: route => route.path
})
const route = useRoute()
const spaceKey = computed<string>(() => typeof route.params.key === 'string' ? route.params.key : route.params.key[0])

const currentSpace = useCurrentSpace()

const { data, pending } = useAsyncData(`space:${spaceKey}`, async () => {
  let ret: CommunitySpaceBasics | null = null
  if (currentSpace.value?.key !== spaceKey.value && spaceKey.value) {
    currentSpace.value = ret = await apiSpaceGetBasics(spaceKey.value)
  } else {
    ret = currentSpace.value
  }
  return ret
}, {
  server: false,
  lazy: true
})

</script>

<template>
  <div class="pt-4">
    <WidgetLoadingCard v-if="pending" />
    <template v-else-if="data">
      <ItemSpaceHeader :space="data" class="mb-2" />
    </template>
  </div>
</template>
