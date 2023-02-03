<script setup lang="ts">
const route = useRoute()
const { space } = inject(spaceInjectKey, { space: useCurrentSpace() })

const { data: list, pending, refresh } = useAsyncData(`questList:${space.value?.key ?? 'unknown'}`, async () => {
  if (typeof space.value?.key === 'string') {
    const { $scripts } = useNuxtApp()
    return await $scripts.spaceGetQuestList(space.value.key)
  } else {
    return []
  }
}, {
  server: false,
  lazy: true
})
</script>

<template>
  <div class=" flex flex-col gap-4">
    <BtnGoPage :next="`${route.path}/create-quest`"> Create a new quest </BtnGoPage>
    <WidgetLoadingCard v-if="pending" />
    <template v-else>
      <ItemSpaceQuestCard v-for="one in list" :key="one.key" :quest="one" @data-updated="refresh" />
    </template>
  </div>
</template>
