<script setup lang="ts">
const route = useRoute()
const current = useCurrentBounty()

const { data: bounty, pending, refresh } = useAsyncData<BountyInfo>('season', async () => {
  const { $scripts } = useNuxtApp();
  if (current.value) {
    return current.value
  } else {
    return $scripts.getBountyById(route.params.bountyId as string)
  }
}, {
  server: false
});

watch(route, (newVal) => {
  refresh();
});

const challengeCfg = computed(() => (bounty.value?.config as ChallengeConfig));
</script>

<template>
  <main>
    <div>
      Header
    </div>
    <section class="container max-w-3xl">
      Challenge detail
    </section>
  </main>
</template>
