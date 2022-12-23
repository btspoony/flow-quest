<script setup lang="ts">
const { data, pending } = useAsyncData<CompetitionSeason | null>('season', async () => {
  return await apiGetActiveSeason()
}, {
  server: false
});
</script>

<template>
  <main v-if="pending" class="min-h-[80vh] flex-center">
    <div :aria-busy="true" />
  </main>
  <FrameGithubAuth v-else>
    <div class="page-container w-full py-8">
      <template v-if="data">
        <h3 class="text-center mb-4">Start with these Challenges</h3>
        <WidgetEndTime :deadline="data.endDate">Season</WidgetEndTime>
        <div :aria-busy="pending" class="max-w-full grid grid-cols-1 lg:grid-cols-2">
          <ItemBountyInfoCard v-for="(bounty, index) in data?.bounties" :key="'idx_' + index" :bounty="bounty" />
        </div>
      </template>
      <div v-else class="hero">
        <div class="hero-content">
          <h4 class="text-center">No Active Season</h4>
        </div>
      </div>
    </div>
  </FrameGithubAuth>
</template>
