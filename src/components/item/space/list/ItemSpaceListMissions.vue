<script setup lang="ts">
const route = useRoute()
const { space } = inject(spaceInjectKey, { space: useCurrentSpace() })

const { data: list, pending } = useAsyncData(`missionList:${space.value?.key ?? 'unknown'}`, async () => {
  if (typeof space.value?.key === 'string') {
    const { $scripts } = useNuxtApp()
    return await $scripts.spaceGetMissionList(space.value.key)
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
    <BtnGoPage :next="`${route.path}/create-mission`"> Create a new mission </BtnGoPage>
    <WidgetLoadingCard v-if="pending" />
    <template v-else>
      <ItemSpaceMissionCard v-for="one in list" :key="one.key" :mission="one" />
    </template>
  </div>
</template>
