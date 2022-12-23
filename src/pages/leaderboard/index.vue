<script setup lang="ts">
const wallet = useFlowAccount()

watch(wallet, (newVal, oldVal) => {
  refresh()
})

interface DataResult {
  season: CompetitionSeason | null;
  ranking: RankingStatus | null;
}

const { data: info, pending, refresh } = useAsyncData<DataResult>(`ranking`, async () => {
  const { $scripts } = useNuxtApp();
  let address = wallet.value && wallet.value?.addr
  const ranking = await $scripts.getRankingStatus(100, address)
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
  return {
    season: await apiGetActiveSeason(),
    ranking
  }
}, {
  server: false
});

</script>

<template>
  <div v-if="!pending && !info?.season" class="hero">
    <div class="hero-content">
      <h4 class="text-center">No Active Season</h4>
    </div>
  </div>
  <template v-else>
    <h2>Leaderboard</h2>
    <section v-if="wallet?.loggedIn" class="mb-8">
      <h5>Your ranking</h5>
      <div v-if="pending" class="w-full h-20" :aria-busy="true" />
      <template v-else-if="info?.ranking?.account">
        <ItemLeaderboardBar :score="info?.ranking?.account" />
      </template>
    </section>
    <section class="mb-0">
      <h5>Top 100 of current season</h5>
      <div v-if="pending" class="w-full h-20" :aria-busy="true" />
      <div v-else class="flex flex-col gap-4">
        <ItemLeaderboardBar v-for="(one, index) in info?.ranking?.tops" :key="`item_${index}`" :score="one" />
      </div>
    </section>
  </template>
</template>
