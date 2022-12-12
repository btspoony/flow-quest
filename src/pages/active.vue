<script setup lang="ts">
const { data, pending } = useAsyncData<CompetitionSeason>('season', async () => {
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
      <h4 class="text-center">Start with these Challenges:</h4>
      <div :aria-busy="pending" class="max-w-full grid grid-cols-1 lg:grid-cols-2">
        <ItemBountyInfoCard v-for="(bounty, index) in data?.bounties" :key="'idx_' + index" :bounty="bounty" />
      </div>
    </div>
  </FrameGithubAuth>
</template>
