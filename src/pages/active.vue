<script setup lang="ts">
const github = useGithubProfile();
const user = useUserProfile();
const wallet = useFlowAccount();

const { data: seasonData, pending } = useAsyncData<CompetitionSeason>('season', async () => {
  return await apiGetActiveSeason()
}, {
  server: false
});
</script>

<template>
  <main v-if="pending" class="min-h-[80vh] flex-center">
    <div :aria-busy="true" />
  </main>
  <main v-else class="container min-h-[calc(100vh-240px)]">
    <div class="hero" v-if="!github.auth">
      <div class="page-container hero-content flex-col">
        <h4>Start Challenges</h4>
        <p>Login with Github to start the challenge tour</p>
        <AuthGithubButton />
      </div>
    </div>
    <div v-else class="page-container w-full py-8">
      <h4 class="text-center">Start with these Challenges:</h4>
      <div :aria-busy="pending" class="max-w-full grid grid-cols-1 lg:grid-cols-2">
        <ItemBountyInfoCard v-for="(bounty, index) in seasonData?.bounties" :key="'idx_' + index" :bounty="bounty" />
      </div>
    </div>
  </main>
</template>
