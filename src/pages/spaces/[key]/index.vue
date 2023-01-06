<script setup lang="ts">
definePageMeta({
  key: route => route.path
})
const route = useRoute()
const spaceKey = computed<string>(() => typeof route.params.key === 'string' ? route.params.key : route.params.key[0])

const currentSpace = useCurrentSpace()

const { data, pending, refresh } = useAsyncData(`space:${spaceKey}`, async () => {
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

type TabTypes = 'challenges' | 'quests'
const currentTab = ref<TabTypes>('challenges')
</script>

<template>
  <div class="pt-4">
<WidgetLoadingCard v-if="pending" />
<template v-else-if="data">
  <ItemSpaceHeader :space="data" class="mb-2" />
  <nav class="mb-2">
    <ul class="tabs">
      <li :class="['tab-link', { 'active': currentTab === 'challenges'}]">Challenges</li>
      <li :class="['tab-link', { 'active': currentTab === 'quests' }]">Quests</li>
    </ul>
  </nav>
  <div class=" flex flex-col gap-4">
    <span>1</span>
    <span>2</span>
  </div>
</template>
  </div>
</template>
