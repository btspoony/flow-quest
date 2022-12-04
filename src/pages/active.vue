<script setup lang="ts">
const profile = useGithubProfile();
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
          <div class="flex-center">
            List of Bounties
          </div>
        </template>
      </div>
    </div>
  </main>
</template>
