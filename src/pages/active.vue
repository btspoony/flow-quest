<script setup lang="ts">
const profile = useGithubProfile();

const { data: seasonData, pending } = useAsyncData<CompetitionSeason>('season', async () => {
  const { $scripts } = useNuxtApp();
  return await $scripts.getActiveSeason()
}, {
  server: false
});
</script>

<template>
  <main>
    <div class="hero min-h-[calc(100vh-100px)]">
      <div class="hero-content narrow flex-col">
        <template v-if="!profile.auth">
          <h4>Start Challenges</h4>
          <p>Login with Github to start the challenge tour</p>
          <AuthGithubButton />
        </template>
        <template v-else>
          <h4>Start with these Challenges:</h4>
          <div :aria-busy="pending" class="flex-center">
            <ItemBountyInfoCard v-for="(bounty, index) in seasonData?.bounties" :key="'idx_'+index" :bounty="bounty" />
          </div>
        </template>
      </div>
    </div>
  </main>
</template>
