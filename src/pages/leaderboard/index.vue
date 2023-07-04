<script setup lang="ts">
const wallet = useFlowAccount()
const user = useUserProfile()
const route = useRoute()

const currentTab = ref(route.query.tab !== 'overall' ? 'active' : 'overall')
const tabs = [
  { label: "Active", key: 'active' },
  { label: "Overall", key: 'overall' },
]

interface DataResult {
  season: CompetitionSeason | null;
  ranking: RankingStatus | null;
}

const { data: info, pending, refresh } = useAsyncData<DataResult>(`ranking`, async () => {
  const { $scripts } = useNuxtApp();
  const ranking = await $scripts.getRankingStatus(
    100,
    user.value?.profileRecord ? user.value.address : null,
    currentTab.value === 'overall'
  )
  let addrs: string[] = []
  if (ranking?.tops.length && ranking?.tops.length > 0) {
    addrs = ranking.tops.map(one => one.account)
  }
  if (ranking?.account) {
    addrs.push(ranking?.account.account)
  }
  if (addrs.length > 0) {
    const identities = await $scripts.profilesGetIdentity(addrs)
    ranking?.tops.forEach(one => {
      one.identity = identities.find(id => id.account === one.account)?.identity
    })
    if (ranking?.account) {
      ranking.account.identity = identities.find(id => id.account === ranking?.account?.account)?.identity
    }
  }
  const loaded = useActiveSeason()
  return {
    season: loaded.value ?? await refreshActiveSeason(),
    ranking
  }
}, {
  server: false
});

watch(user, (newVal, oldVal) => {
  refresh()
})

watch(() => route.query, (newQuery) => {
  if (newQuery.tab !== currentTab.value) {
    if (newQuery.tab === 'overall') {
      currentTab.value = 'overall'
    } else {
      currentTab.value = 'active'
    }
    refresh()
  }
})

function updateRoute(name: string) {
  const router = useRouter()
  const obj = geneReferralLinkObject(route.path)
  obj.query = Object.assign({}, obj.query, { tab: name })
  router.replace(obj)
}
</script>

<template>
  <FrameMain>
    <div class="page-container w-full">
      <h2 class="mb-0 mt-12">Leaderboard</h2>
      <nav class="py-4">
        <ul class="tabs">
          <li v-for="tab in tabs" :key="tab.key" :class="['tab-link', { 'active': currentTab === tab.key }]"
            @click="updateRoute(tab.key)">
            {{ tab.label }}
          </li>
        </ul>
      </nav>
      <SectionLeaderboardActiveInfo v-if="currentTab === 'active' && info?.season?.seasonId" :season="info.season" />
      <div v-if="currentTab === 'active' && !info?.season?.seasonId">
        <div class="hero">
          <div class="hero-content">
            No Active Season
          </div>
        </div>
      </div>
      <template v-else>
        <section v-if="wallet?.loggedIn && user?.profileRecord" class="mb-8">
          <h5>Your ranking</h5>
          <div v-if="pending" class="w-full h-12" :aria-busy="true" />
          <template v-else-if="info?.ranking?.account">
            <ItemLeaderboardBar :score="info?.ranking?.account" />
          </template>
        </section>
        <section class="mb-0">
          <h5>Top 100</h5>
          <div v-if="pending" class="w-full h-12" :aria-busy="true" />
          <div v-else class="flex flex-col gap-4">
            <ItemLeaderboardBar v-for="(one, index) in info?.ranking?.tops" :key="`item_${index}`" :score="one" />
          </div>
        </section>
      </template>
    </div>
  </FrameMain>
</template>
