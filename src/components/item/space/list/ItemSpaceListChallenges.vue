<script setup lang="ts">
const route = useRoute()
const { space } = inject(spaceInjectKey, { space: useCurrentSpace() })

const { data: list, pending } = useAsyncData(`challengeList:${space.value?.key ?? 'unknown'}`, async () => {
  if (typeof space.value?.key === 'string') {
    const { $scripts } = useNuxtApp()
    return await $scripts.spaceGetChallengeList(space.value.key)
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
    <BtnGoPage :next="`${route.path}/create-challenge`"> Create a new challenge </BtnGoPage>
    <WidgetLoadingCard v-if="pending" />
    <template v-else>
      <ItemSpaceChallengeCard v-for="one in list" :key="one.key" :challenge="one" />
    </template>
  </div>
</template>
