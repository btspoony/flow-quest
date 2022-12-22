<script setup lang="ts">
const wallet = useFlowAccount()

watch(wallet, (newVal, oldVal) => {
  refresh()
})

const { data: info, pending, refresh } = useAsyncData<RankingStatus | null>(`ranking`, async () => {
  const { $scripts } = useNuxtApp();
  let address = wallet.value && wallet.value?.addr
  const result = await $scripts.getRankingStatus(100, address)
  let addrs: string[] = []
  if (result?.tops.length && result?.tops.length > 0) {
    addrs = result.tops.map(one => one.account)
  }
  if (result?.account) {
    addrs.push(result?.account.account)
  }
  if (addrs.length > 0) {
    const identities = await $scripts.profilesGetIdentity(addrs)
    result?.tops.forEach(one => {
      one.identity = identities.find(id => id.account === one.account)?.identity
    })
    if (result?.account) {
      result.account.identity = identities.find(id => id.account === result?.account?.account)?.identity
    }
  }
  return result
}, {
  server: false
});

</script>

<template>
  <section v-if="wallet?.loggedIn" class="mb-8">
    <h5>Your ranking</h5>
    <div v-if="pending" class="w-full h-20" :aria-busy="true" />
    <template v-else-if="info?.account">
      <ItemLeaderboardBar :score="info?.account" />
    </template>
  </section>
  <section class="mb-0">
    <h5>Top 100 of current season</h5>
    <div v-if="pending" class="w-full h-20" :aria-busy="true" />
    <div v-else class="flex flex-col gap-4">
      <ItemLeaderboardBar v-for="(one, index) in info?.tops" :key="`item_${index}`" :score="one" />
    </div>
  </section>
</template>
