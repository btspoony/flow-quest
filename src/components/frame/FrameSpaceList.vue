<script setup lang="ts">
withDefaults(defineProps<{
  noTopbar?: boolean
}>(), {
  noTopbar: false
});
const user = useUserProfile()

const { data: list, pending, refresh } = useAsyncData<Array<CommunitySpaceBasics | null>>(`spaces:${user.value?.address ?? 'unknown'}`, async () => {
  let result: Array<CommunitySpaceBasics | null> = []
  if (typeof user.value?.address === 'string') {
    const { $scripts } = useNuxtApp()
    const res = await $scripts.spaceGetList(user.value.address)
    if (res.length > 0) {
      for (let i = 0; i < res.length; i++) {
        result.push(res[i])
      }
    }
  }
  result.push(null)
  return result
}, {
  server: false,
  lazy: true,
})

watch(user, async (newVal) => {
  refresh()
})
</script>

<template>
  <div v-if="!noTopbar" class="h-[90px]"></div>
  <div class="container min-h-[calc(100vh-180px)] flex gap-4 w-full">
    <aside class="flex-none aside border-gray-300 dark:border-gray-700">
      <div v-if="pending" :aria-busy="true" />
      <template v-else>
        <ItemSpaceIcon v-for="one in list" :key="one ? one.id : 'create'" :space="one" />
      </template>
    </aside>
    <main class="flex-auto w-full">
      <div class="relative mx-auto max-w-2xl">
        <slot />
      </div>
    </main>
  </div>
</template>

<style scoped>
.aside {
  @apply h-[calc(100vh-180px)] w-14 pt-4;
  @apply flex flex-col items-center justify-start gap-2;
  @apply border-y-0 border-l-0 border-r border-solid;
}
</style>
