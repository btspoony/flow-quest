<script setup lang="ts">
import ItemSpaceListQuests from '~/components/item/space/list/ItemSpaceListQuests.vue'
import ItemSpaceListMissions from '~/components/item/space/list/ItemSpaceListMissions.vue'

definePageMeta({
  title: "Space",
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

const currentTab = ref(route.query.tab === 'Missions' ? 'Missions' : 'Quests')
const tabs = [
  { label: "Quests", comp: ItemSpaceListQuests },
  { label: "Missions", comp: ItemSpaceListMissions },
]
const currentComponent = computed(() => tabs.find(tab => tab.label === currentTab.value)?.comp)

watch(() => route.query, (newQuery) => {
  if (newQuery.tab === 'Missions') {
    currentTab.value = 'Missions'
  } else {
    currentTab.value = 'Quests'
  }
})

function updateRoute(name: string) {
  const router = useRouter()
  router.replace({ path: route.path, query: { tab: name } })
}
</script>

<template>
  <div class="pt-4">
    <WidgetLoadingCard v-if="pending" />
<template v-else-if="data">
    <ItemSpaceHeader :space="data" class="mb-2" />
    <nav class="mb-4">
      <ul class="tabs">
        <li v-for="tab in tabs" :key="tab.label" :class="['tab-link', { 'active': currentTab === tab.label }]"
          @click="updateRoute(tab.label)">
          {{ tab.label }}
        </li>
      </ul>
      </nav>
    <component v-if="currentComponent" :is="currentComponent"></component>
</template>
  </div>
</template>
