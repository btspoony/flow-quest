<script setup lang="ts">
const wallet = useFlowAccount()
const user = useUserProfile()

watch(user, (newVal, oldVal) => {
  refresh()
})

interface DataResult {
  ranking: RankingStatus | null;
}

const { data: info, pending, refresh } = useAsyncData<DataResult>(`ranking`, async () => {
  const { $scripts } = useNuxtApp();
  const ranking = await $scripts.getRankingStatus(100, user.value?.profileRecord ? user.value.address : null)
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
    ranking
  }
}, {
  server: false
});

</script>

<template>
  <FrameMain class="max-w-3xl py-8">
    <h2>Leaderboard</h2>
    <section v-if="wallet?.loggedIn && user?.profileRecord" class="mb-8">
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
  </FrameMain>
</template>
