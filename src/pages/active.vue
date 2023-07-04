<script setup lang="ts">
const { data, pending } = useAsyncData<CompetitionSeason | null>('season', async () => {
  return refreshActiveSeason()
}, {
  server: false
});

const route = useRoute()

function updateRoute(name: string) {
  const router = useRouter()
  router.replace({ path: route.path, query: { tab: name } })
}

const currentTab = ref(route.query.tab ?? 'beginner')
const filteredTabs = computed(() => {
  if (!data.value || data.value.bounties?.length === 0) return []
  const allBounties = data.value.bounties
  const difficulties = allBounties.map(bounty => bounty.difficulty)
  const uniqueDifficulties = [...new Set(difficulties)]
  uniqueDifficulties.sort((a, b) => a - b)
  return uniqueDifficulties.map(difficulty => {
    let label: string
    switch (difficulty) {
      case 1:
        label = 'experienced'
        break
      case 2:
        label = 'expert'
        break
      case 0:
      default:
        label = 'beginner'
        break
    }
    return {
      difficulty,
      label,
      display: label.charAt(0).toUpperCase() + label.slice(1)
    }
  })
})
const currentTabInfo = computed(() => {
  return filteredTabs.value.find(tab => tab.label === currentTab.value)
})

watch(() => route.query, (newQuery) => {
  if (filteredTabs.value.find(tab => tab.label === newQuery.tab)) {
    currentTab.value = newQuery.tab!
  } else {
    currentTab.value = filteredTabs.value[0]?.label
  }
})

const filteredBounties = computed(() => {
  if (!data.value || data.value.bounties?.length === 0) return []
  return data.value.bounties.filter(bounty => bounty.difficulty === currentTabInfo.value?.difficulty)
})

</script>

<template>
  <FrameMain :content-loading="pending">
    <div class="page-container w-full">
      <template v-if="data && data.bounties.length > 0">
        <h2 class="mb-0 mt-12">Quests for Developers</h2>
        <nav class="py-4">
          <ul class="tabs">
            <li v-for="tab in filteredTabs" :key="tab.label" :class="['tab-link', { 'active': currentTab === tab.label }]"
              @click="updateRoute(tab.label)">
              {{ tab.display }}
            </li>
          </ul>
        </nav>
        <div
          v-if="data?.bounties.length > 0"
          class="w-full flex flex-row flex-wrap items-center gap-5"
        >
          <ItemBountyInfoCard
            class="basis-full lg:basis-[48%]"
            v-for="(bounty, index) in filteredBounties" :key="'bounty_idx_' + index"
            :bounty="bounty"
          />
        </div>
      </template>
      <div v-else class="hero">
        <div class="hero-content">
          <h4 class="text-center">No available quests</h4>
        </div>
      </div>
    </div>
  </FrameMain>
</template>
