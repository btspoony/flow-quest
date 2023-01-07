<script setup lang="ts">
const route = useRoute()
const { space } = inject(spaceInjectKey, { space: useCurrentSpace() })

const { data: list, pending } = useAsyncData(`questList:${space.value?.key ?? 'unknown'}`, async () => {
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
    <div v-else v-for="one in list" :key="one.key" class="card card-border non-interactive p-4">
      <span class="tag">{{ one.key }}</span>
      <details class="mt-4 mb-0 border-b-0">
        <summary>
          <div class="w-[80%] inline-flex items-center justify-between">
            <span><b>Title: </b>{{ one.display.name }}</span>
            <span><b>Steps: </b>{{ one.steps }}</span>
          </div>
        </summary>
        <div><b>Steps JSON: </b><br />{{ one.stepsCfg }}</div>
        <div><b>Guide Markdown: </b><br />{{ one.guideMD }}</div>
      </details>
    </div>
  </div>
</template>
