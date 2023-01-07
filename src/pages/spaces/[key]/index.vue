<script setup lang="ts">
import ItemSpaceListChallenges from '~/components/item/space/list/ItemSpaceListChallenges.vue'
import ItemSpaceListQuests from '~/components/item/space/list/ItemSpaceListQuests.vue'

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

provide(spaceInjectKey, { space: data, refresh })

const currentTab = ref('Challenges')
const tabs = [
  { label: "Challenges", comp: ItemSpaceListChallenges },
  { label: "Quests", comp: ItemSpaceListQuests },
]
const currentComponent = computed(() => tabs.find(tab => tab.label === currentTab.value)?.comp)
</script>

<template>
  <div class="pt-4">
    <WidgetLoadingCard v-if="pending" />
<template v-else-if="data">
    <ItemSpaceHeader :space="data" class="mb-2" />
    <nav class="mb-4">
      <ul class="tabs">
        <li v-for="tab in tabs" :key="tab.label" :class="['tab-link', { 'active': currentTab === tab.label }]"
          @click="currentTab = tab.label">
          {{ tab.label }}
        </li>
        </ul>
        </nav>
    <component v-if="currentComponent" :is="currentComponent"></component>
</template>
  </div>
</template>
