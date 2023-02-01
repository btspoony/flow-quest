<script setup lang="ts">
const { data, pending } = useAsyncData<CompetitionSeason | null>('season', async () => {
  return refreshActiveSeason()
}, {
  server: false
});
</script>

<template>
  <WidgetLoadingCard v-if="pending" />
  <FrameGithubAuth v-else>
    <div class="page-container w-full py-8">
      <template v-if="data && data.bounties.length > 0">
        <h3 class="text-center mb-4">Start with these Quests</h3>
        <WidgetEndTime v-if="data.seasonId && data.endDate" :deadline="data.endDate">Season</WidgetEndTime>
        <div class="max-w-full grid grid-cols-1 lg:grid-cols-2">
          <ItemBountyInfoCard v-for="(bounty, index) in data?.bounties" :key="'bounty_idx_' + index" :bounty="bounty" />
        </div>
      </template>
      <div v-else class="hero">
        <div class="hero-content">
          <h4 class="text-center">No available quests</h4>
        </div>
      </div>
    </div>
  </FrameGithubAuth>
</template>
