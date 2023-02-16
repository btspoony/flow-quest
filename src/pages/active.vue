<script setup lang="ts">
const { data, pending } = useAsyncData<CompetitionSeason | null>('season', async () => {
  return refreshActiveSeason()
}, {
  server: false
});
</script>

<template>
  <FrameMain :content-loading="pending">
    <div class="page-container w-full py-8">
      <template v-if="data && data.bounties.length > 0">
        <h2 class="text-center mb-8">Start with these Quests</h2>
        <div class="w-full flex flex-row flex-wrap items-center gap-5">
          <ItemBountyInfoCard
            class="basis-full lg:basis-[48%]"
            v-for="(bounty, index) in data?.bounties" :key="'bounty_idx_' + index"
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
